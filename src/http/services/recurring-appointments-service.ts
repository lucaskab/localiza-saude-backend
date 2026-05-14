import { prisma } from "@/database/prisma";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import { UnauthorizedError } from "@/http/routes/_errors/unauthorized-error";
import { clinicRbac } from "@/http/services/clinic-rbac";
import type { ServiceModality } from "@/schemas/service-modalities";
import type { Prisma, user } from "../../../prisma/generated/prisma/client";

const DEFAULT_BOOKING_AVAILABILITY_DAYS = 60;
const MAX_BOOKING_AVAILABILITY_DAYS = 365;

const recurringSeriesInclude = {
	customer: true,
	patientProfile: true,
	healthcareProvider: true,
	rules: {
		orderBy: [{ dayOfWeek: "asc" as const }, { startTime: "asc" as const }],
	},
	procedures: {
		include: {
			procedure: true,
		},
	},
} satisfies Prisma.appointment_recurring_seriesInclude;

type RecurringSeriesWithRelations =
	Prisma.appointment_recurring_seriesGetPayload<{
		include: typeof recurringSeriesInclude;
	}>;

export type RecurringWeeklySlotInput = {
	dayOfWeek: number;
	startTime: string;
};

type CreateRecurringSeriesInput = {
	currentUser: user;
	customerId: string | null;
	patientProfileId: string | null;
	healthcareProviderId: string;
	scheduledAt: Date;
	serviceModality: ServiceModality;
	notes?: string | null;
	procedureIds: string[];
	recurrence: {
		isIndefinite: boolean;
		endsOn?: string | null;
		weeklySlots: RecurringWeeklySlotInput[];
	};
};

type UpdateRecurringSeriesInput = {
	currentUser: user;
	notes?: string | null;
	recurrence: {
		isIndefinite: boolean;
		endsOn?: string | null;
		weeklySlots: RecurringWeeklySlotInput[];
	};
};

function startOfUtcDay(date: Date) {
	const result = new Date(date);
	result.setUTCHours(0, 0, 0, 0);
	return result;
}

function endOfUtcDay(date: Date) {
	const result = new Date(date);
	result.setUTCHours(23, 59, 59, 999);
	return result;
}

function addUtcDays(date: Date, days: number) {
	const result = new Date(date);
	result.setUTCDate(result.getUTCDate() + days);
	return result;
}

function parseUtcDateInput(date: string) {
	const [year = 0, month = 1, day = 1] = date.split("-").map(Number);
	return new Date(Date.UTC(year, month - 1, day));
}

function timeToMinutes(time: string) {
	const [hours = 0, minutes = 0] = time.split(":").map(Number);
	return hours * 60 + minutes;
}

function dateTimeToMinutes(date: Date) {
	return date.getUTCHours() * 60 + date.getUTCMinutes();
}

function formatTimeFromDate(date: Date) {
	return `${date.getUTCHours().toString().padStart(2, "0")}:${date
		.getUTCMinutes()
		.toString()
		.padStart(2, "0")}`;
}

function hasTimeOverlap(
	startA: number,
	endA: number,
	startB: number,
	endB: number,
) {
	return startA < endB && endA > startB;
}

function hasDateOverlap(
	startA: Date,
	endA: Date,
	startB: Date,
	endB: Date,
) {
	return startA < endB && endA > startB;
}

function isValidTimeRange(startTime: string, endTime: string) {
	return timeToMinutes(startTime) < timeToMinutes(endTime);
}

function buildUtcDateWithTime(date: Date, time: string) {
	const [hours = 0, minutes = 0] = time.split(":").map(Number);
	return new Date(
		Date.UTC(
			date.getUTCFullYear(),
			date.getUTCMonth(),
			date.getUTCDate(),
			hours,
			minutes,
			0,
			0,
		),
	);
}

function normalizeWeeklySlots(
	scheduledAt: Date,
	weeklySlots: RecurringWeeklySlotInput[],
) {
	const uniqueSlots = new Map<string, RecurringWeeklySlotInput>();
	const primarySlot = {
		dayOfWeek: scheduledAt.getUTCDay(),
		startTime: formatTimeFromDate(scheduledAt),
	};

	for (const slot of [primarySlot, ...weeklySlots]) {
		const key = `${slot.dayOfWeek}-${slot.startTime}`;
		if (!uniqueSlots.has(key)) {
			uniqueSlots.set(key, slot);
		}
	}

	return Array.from(uniqueSlots.values()).sort((a, b) => {
		if (a.dayOfWeek !== b.dayOfWeek) {
			return a.dayOfWeek - b.dayOfWeek;
		}

		return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
	});
}

function uniqueWeeklySlots(weeklySlots: RecurringWeeklySlotInput[]) {
	const uniqueSlots = new Map<string, RecurringWeeklySlotInput>();

	for (const slot of weeklySlots) {
		const key = `${slot.dayOfWeek}-${slot.startTime}`;
		if (!uniqueSlots.has(key)) {
			uniqueSlots.set(key, slot);
		}
	}

	return Array.from(uniqueSlots.values()).sort((a, b) => {
		if (a.dayOfWeek !== b.dayOfWeek) {
			return a.dayOfWeek - b.dayOfWeek;
		}

		return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
	});
}

function getBookingWindowEndDate(
	bookingAvailabilityDays: number | null | undefined,
	referenceDate = new Date(),
) {
	const normalizedDays = Math.min(
		Math.max(bookingAvailabilityDays ?? DEFAULT_BOOKING_AVAILABILITY_DAYS, 1),
		MAX_BOOKING_AVAILABILITY_DAYS,
	);

	return endOfUtcDay(addUtcDays(startOfUtcDay(referenceDate), normalizedDays));
}

function getSeriesGenerationEndDate(
	series: RecurringSeriesWithRelations,
	bookingWindowEnd: Date,
) {
	if (!series.endsOn) {
		return bookingWindowEnd;
	}

	const recurrenceEnd = endOfUtcDay(series.endsOn);
	return recurrenceEnd < bookingWindowEnd ? recurrenceEnd : bookingWindowEnd;
}

function formatConflictDate(date: Date) {
	return date.toISOString().slice(0, 16).replace("T", " ");
}

function buildWorkingRangesForDate({
	date,
	schedules,
	exceptions,
}: {
	date: Date;
	schedules: Array<{ dayOfWeek: number; startTime: string; endTime: string }>;
	exceptions: Array<{
		type: string;
		startTime: string | null;
		endTime: string | null;
	}>;
}) {
	const hasFullDayOff = exceptions.some(
		(exception) =>
			exception.type === "DAY_OFF" &&
			(!exception.startTime || !exception.endTime),
	);

	if (hasFullDayOff) {
		return {
			workingRanges: [] as Array<{ startTime: string; endTime: string }>,
			blockedRanges: [] as Array<{ startTime: string; endTime: string }>,
		};
	}

	const dayOfWeek = date.getUTCDay();
	const recurringRanges = schedules
		.filter((schedule) => schedule.dayOfWeek === dayOfWeek)
		.map((schedule) => ({
			startTime: schedule.startTime,
			endTime: schedule.endTime,
		}))
		.filter((range) => isValidTimeRange(range.startTime, range.endTime));

	const specialRanges = exceptions
		.filter(
			(exception) =>
				exception.type === "SPECIAL_HOURS" &&
				exception.startTime &&
				exception.endTime,
		)
		.map((exception) => ({
			startTime: exception.startTime as string,
			endTime: exception.endTime as string,
		}))
		.filter((range) => isValidTimeRange(range.startTime, range.endTime));

	const extraRanges = exceptions
		.filter(
			(exception) =>
				exception.type === "EXTRA_SLOT" &&
				exception.startTime &&
				exception.endTime,
		)
		.map((exception) => ({
			startTime: exception.startTime as string,
			endTime: exception.endTime as string,
		}))
		.filter((range) => isValidTimeRange(range.startTime, range.endTime));

	const workingRanges = [...(specialRanges.length > 0 ? specialRanges : recurringRanges), ...extraRanges];
	const blockedRanges = exceptions
		.filter(
			(exception) =>
				(exception.type === "DAY_OFF" || exception.type === "TIME_BLOCK") &&
				exception.startTime &&
				exception.endTime,
		)
		.map((exception) => ({
			startTime: exception.startTime as string,
			endTime: exception.endTime as string,
		}))
		.filter((range) => isValidTimeRange(range.startTime, range.endTime));

	return { workingRanges, blockedRanges };
}

function canOccurrenceFitInSchedule({
	occurrenceStart,
	durationMinutes,
	schedules,
	exceptions,
}: {
	occurrenceStart: Date;
	durationMinutes: number;
	schedules: Array<{ dayOfWeek: number; startTime: string; endTime: string }>;
	exceptions: Array<{
		type: string;
		startTime: string | null;
		endTime: string | null;
	}>;
}) {
	const { workingRanges, blockedRanges } = buildWorkingRangesForDate({
		date: occurrenceStart,
		schedules,
		exceptions,
	});

	if (workingRanges.length === 0) {
		return false;
	}

	const occurrenceStartMinutes = dateTimeToMinutes(occurrenceStart);
	const occurrenceEndMinutes = occurrenceStartMinutes + durationMinutes;

	const fitsWorkingRange = workingRanges.some((range) => {
		const rangeStart = timeToMinutes(range.startTime);
		const rangeEnd = timeToMinutes(range.endTime);

		return occurrenceStartMinutes >= rangeStart && occurrenceEndMinutes <= rangeEnd;
	});

	if (!fitsWorkingRange) {
		return false;
	}

	return !blockedRanges.some((range) =>
		hasTimeOverlap(
			occurrenceStartMinutes,
			occurrenceEndMinutes,
			timeToMinutes(range.startTime),
			timeToMinutes(range.endTime),
		),
	);
}

function mapExceptionsByDate<
	T extends {
		date: Date;
		type: string;
		startTime: string | null;
		endTime: string | null;
	},
>(exceptions: T[]) {
	const map = new Map<string, T[]>();

	for (const exception of exceptions) {
		const key = exception.date.toISOString().slice(0, 10);
		const current = map.get(key) ?? [];
		current.push(exception);
		map.set(key, current);
	}

	return map;
}

function buildRecurringSeriesSummary(series: RecurringSeriesWithRelations) {
	return {
		id: series.id,
		customerId: series.customerId,
		patientProfileId: series.patientProfileId,
		healthcareProviderId: series.healthcareProviderId,
		createdByUserId: series.createdByUserId,
		serviceModality: series.serviceModality,
		notes: series.notes,
		startsOn: series.startsOn,
		endsOn: series.endsOn,
		isIndefinite: series.isIndefinite,
		isActive: series.isActive,
		generatedUntil: series.generatedUntil,
		cancelledAt: series.cancelledAt,
		createdAt: series.createdAt,
		updatedAt: series.updatedAt,
		weeklySlots: series.rules,
	};
}

async function getProviderForBookingWindow(healthcareProviderId: string) {
	const provider = await prisma.user.findFirst({
		where: {
			id: healthcareProviderId,
			role: "HEALTHCARE_PROVIDER",
		},
		select: {
			id: true,
			role: true,
			bookingAvailabilityDays: true,
		},
	});

	if (!provider) {
		throw new BadRequestError("Healthcare provider not found");
	}

	return provider;
}

async function assertCanManageRecurringSeries(
	currentUser: user,
	series: RecurringSeriesWithRelations,
) {
	if (
		series.customerId === currentUser.id ||
		series.patientProfile?.customerOwnerId === currentUser.id ||
		series.healthcareProviderId === currentUser.id ||
		currentUser.role === "ADMIN"
	) {
		return;
	}

	if (currentUser.role === "STAFF" || currentUser.role === "HEALTHCARE_PROVIDER") {
		await clinicRbac.assertCanManageProvider(
			currentUser,
			series.healthcareProviderId,
			"MANAGE_APPOINTMENTS",
		);
		return;
	}

	throw new UnauthorizedError("You cannot manage this recurring appointment");
}

async function cancelFutureSeriesAppointmentsTx(
	tx: Prisma.TransactionClient,
	seriesId: string,
	currentUserId: string,
	reason: string,
	fromDate = new Date(),
) {
	await tx.appointment.updateMany({
		where: {
			recurringSeriesId: seriesId,
			scheduledAt: {
				gte: fromDate,
			},
			status: {
				not: "CANCELLED",
			},
		},
		data: {
			status: "CANCELLED",
			cancellationReason: reason,
			cancelledAt: new Date(),
			cancelledByUserId: currentUserId,
		},
	});
}

async function syncSeriesAppointmentsTx({
	tx,
	series,
	bookingWindowEnd,
	strict,
}: {
	tx: Prisma.TransactionClient;
	series: RecurringSeriesWithRelations;
	bookingWindowEnd: Date;
	strict: boolean;
}) {
	const generationEnd = getSeriesGenerationEndDate(series, bookingWindowEnd);
	const generationStart = startOfUtcDay(new Date());
	const effectiveStart = series.startsOn > generationStart ? series.startsOn : generationStart;

	if (generationEnd < effectiveStart) {
		await tx.appointment_recurring_series.update({
			where: { id: series.id },
			data: {
				generatedUntil: generationEnd,
			},
		});
		return;
	}

	const schedules = await tx.healthcare_provider_schedule.findMany({
		where: {
			healthcareProviderId: series.healthcareProviderId,
			isActive: true,
		},
		select: {
			dayOfWeek: true,
			startTime: true,
			endTime: true,
		},
	});

	const exceptions = await tx.healthcare_provider_schedule_exception.findMany({
		where: {
			healthcareProviderId: series.healthcareProviderId,
			date: {
				gte: startOfUtcDay(effectiveStart),
				lte: endOfUtcDay(generationEnd),
			},
			isActive: true,
		},
		select: {
			date: true,
			type: true,
			startTime: true,
			endTime: true,
		},
	});

	const existingAppointments = await tx.appointment.findMany({
		where: {
			healthcareProviderId: series.healthcareProviderId,
			scheduledAt: {
				gte: startOfUtcDay(effectiveStart),
				lte: endOfUtcDay(generationEnd),
			},
			status: {
				not: "CANCELLED",
			},
		},
		select: {
			id: true,
			recurringSeriesId: true,
			scheduledAt: true,
			totalDurationMinutes: true,
		},
		orderBy: {
			scheduledAt: "asc",
		},
	});

	const exceptionsByDate = mapExceptionsByDate(exceptions);
	const procedureIds = series.procedures.map((item) => item.procedureId);
	const totalDurationMinutes = series.procedures.reduce(
		(total, item) => total + item.procedure.durationInMinutes,
		0,
	);
	const totalPriceCents = series.procedures.reduce(
		(total, item) => total + item.procedure.priceInCents,
		0,
	);
	const existingByStart = new Map(
		existingAppointments.map((appointment) => [
			appointment.scheduledAt.toISOString(),
			appointment,
		]),
	);

	for (const rule of series.rules) {
		const current = startOfUtcDay(effectiveStart);

		while (current <= generationEnd) {
			if (current.getUTCDay() !== rule.dayOfWeek) {
				current.setUTCDate(current.getUTCDate() + 1);
				continue;
			}

			const occurrenceStart = buildUtcDateWithTime(current, rule.startTime);
			const occurrenceEnd = new Date(
				occurrenceStart.getTime() + totalDurationMinutes * 60 * 1000,
			);

			if (occurrenceStart < effectiveStart) {
				current.setUTCDate(current.getUTCDate() + 7);
				continue;
			}

			if (series.endsOn && occurrenceStart > endOfUtcDay(series.endsOn)) {
				break;
			}

			const existingExact = existingByStart.get(occurrenceStart.toISOString());
			if (existingExact?.recurringSeriesId === series.id) {
				current.setUTCDate(current.getUTCDate() + 7);
				continue;
			}

			const dateKey = occurrenceStart.toISOString().slice(0, 10);
			const occurrenceExceptions = exceptionsByDate.get(dateKey) ?? [];
			const fitsSchedule = canOccurrenceFitInSchedule({
				occurrenceStart,
				durationMinutes: totalDurationMinutes,
				schedules,
				exceptions: occurrenceExceptions,
			});

			if (!fitsSchedule) {
				if (strict) {
					throw new BadRequestError(
						`Recurring appointment does not fit provider schedule on ${formatConflictDate(
							occurrenceStart,
						)}`,
					);
				}

				current.setUTCDate(current.getUTCDate() + 7);
				continue;
			}

			const conflict = existingAppointments.find((appointment) => {
				if (appointment.recurringSeriesId === series.id) {
					return false;
				}

				const existingStart = appointment.scheduledAt;
				const existingEnd = new Date(
					existingStart.getTime() +
						appointment.totalDurationMinutes * 60 * 1000,
				);

				return hasDateOverlap(
					occurrenceStart,
					occurrenceEnd,
					existingStart,
					existingEnd,
				);
			});

			if (conflict) {
				if (strict) {
					throw new BadRequestError(
						`Recurring appointment conflicts with another booking on ${formatConflictDate(
							occurrenceStart,
						)}`,
					);
				}

				current.setUTCDate(current.getUTCDate() + 7);
				continue;
			}

			const createdAppointment = await tx.appointment.create({
				data: {
					customerId: series.customerId,
					patientProfileId: series.patientProfileId,
					healthcareProviderId: series.healthcareProviderId,
					recurringSeriesId: series.id,
					recurringRuleId: rule.id,
					recurringGeneratedAt: new Date(),
					scheduledAt: occurrenceStart,
					serviceModality: series.serviceModality,
					notes: series.notes,
					totalDurationMinutes,
					totalPriceCents,
					status: "SCHEDULED",
					appointmentProcedures: {
						create: procedureIds.map((procedureId) => ({
							procedureId,
						})),
					},
				},
				select: {
					id: true,
					recurringSeriesId: true,
					scheduledAt: true,
					totalDurationMinutes: true,
				},
			});

			existingAppointments.push(createdAppointment);
			existingByStart.set(
				createdAppointment.scheduledAt.toISOString(),
				createdAppointment,
			);
			current.setUTCDate(current.getUTCDate() + 7);
		}
	}

	await tx.appointment_recurring_series.update({
		where: { id: series.id },
		data: {
			generatedUntil: generationEnd,
		},
	});
}

export const recurringAppointmentsService = {
	assertScheduledAtWithinBookingWindow(
		bookingAvailabilityDays: number | null | undefined,
		scheduledAt: Date,
	) {
		const bookingWindowEnd = getBookingWindowEndDate(bookingAvailabilityDays);

		if (scheduledAt > bookingWindowEnd) {
			throw new BadRequestError(
				"Selected date is outside the provider booking window",
			);
		}

		return bookingWindowEnd;
	},

	async ensureProviderRecurringAppointmentsUpToDate(
		healthcareProviderId: string,
		upToDate: Date,
	) {
		const provider = await getProviderForBookingWindow(healthcareProviderId);
		const bookingWindowEnd = getBookingWindowEndDate(
			provider.bookingAvailabilityDays,
		);
		const targetEnd = endOfUtcDay(upToDate) < bookingWindowEnd ? endOfUtcDay(upToDate) : bookingWindowEnd;

		if (targetEnd < startOfUtcDay(new Date())) {
			return;
		}

		const activeSeries = await prisma.appointment_recurring_series.findMany({
			where: {
				healthcareProviderId,
				isActive: true,
				startsOn: {
					lte: targetEnd,
				},
				OR: [{ endsOn: null }, { endsOn: { gte: startOfUtcDay(new Date()) } }],
			},
			include: recurringSeriesInclude,
		});

		for (const series of activeSeries) {
			await prisma.$transaction(async (tx) => {
				await syncSeriesAppointmentsTx({
					tx,
					series,
					bookingWindowEnd,
					strict: false,
				});
			});
		}
	},

	async createSeriesFromAppointment(input: CreateRecurringSeriesInput) {
		const provider = await getProviderForBookingWindow(input.healthcareProviderId);
		const bookingWindowEnd = this.assertScheduledAtWithinBookingWindow(
			provider.bookingAvailabilityDays,
			input.scheduledAt,
		);
		const normalizedSlots = normalizeWeeklySlots(
			input.scheduledAt,
			input.recurrence.weeklySlots,
		);
		const startsOn = startOfUtcDay(input.scheduledAt);
		const endsOn = input.recurrence.endsOn
			? parseUtcDateInput(input.recurrence.endsOn)
			: null;

		if (!input.recurrence.isIndefinite && !endsOn) {
			throw new BadRequestError(
				"Recurring appointments must define an end date or be indefinite",
			);
		}

		if (endsOn && endOfUtcDay(endsOn) < input.scheduledAt) {
			throw new BadRequestError(
				"Recurring appointment end date must be after the first occurrence",
			);
		}

		const { recurringSeries, appointment } = await prisma.$transaction(
			async (tx) => {
				const procedures = await tx.procedure.findMany({
					where: {
						id: {
							in: input.procedureIds,
						},
						healthcareProviderId: input.healthcareProviderId,
					},
				});

				if (procedures.length !== input.procedureIds.length) {
					throw new BadRequestError(
						"One or more procedures not found or do not belong to this provider",
					);
				}

				const recurringSeries = await tx.appointment_recurring_series.create({
					data: {
						customerId: input.customerId,
						patientProfileId: input.patientProfileId,
						healthcareProviderId: input.healthcareProviderId,
						createdByUserId: input.currentUser.id,
						serviceModality: input.serviceModality,
						notes: input.notes ?? null,
						startsOn,
						endsOn,
						isIndefinite: input.recurrence.isIndefinite,
						rules: {
							create: normalizedSlots,
						},
						procedures: {
							create: input.procedureIds.map((procedureId) => ({
								procedureId,
							})),
						},
					},
					include: recurringSeriesInclude,
				});

				await syncSeriesAppointmentsTx({
					tx,
					series: recurringSeries,
					bookingWindowEnd,
					strict: true,
				});

				const appointment = await tx.appointment.findFirst({
					where: {
						recurringSeriesId: recurringSeries.id,
						scheduledAt: input.scheduledAt,
					},
					include: {
						customer: true,
						patientProfile: true,
						healthcareProvider: true,
						cancelledByUser: true,
						recurringSeries: {
							include: {
								rules: {
									orderBy: [
										{ dayOfWeek: "asc" },
										{ startTime: "asc" },
									],
								},
							},
						},
						recurringRule: true,
						appointmentProcedures: {
							include: {
								procedure: {
									include: {
										checklistItems: {
											orderBy: {
												position: "asc",
											},
										},
									},
								},
							},
							orderBy: {
								createdAt: "desc",
							},
						},
						rescheduleRequests: {
							orderBy: {
								createdAt: "desc",
							},
						},
					},
				});

				if (!appointment) {
					throw new BadRequestError(
						"Could not create the first recurring appointment occurrence",
					);
				}

				return {
					recurringSeries,
					appointment,
				};
			},
		);

		return {
			recurringSeries: buildRecurringSeriesSummary(recurringSeries),
			appointment,
		};
	},

	async updateSeries(seriesId: string, input: UpdateRecurringSeriesInput) {
		const existingSeries = await prisma.appointment_recurring_series.findUnique({
			where: { id: seriesId },
			include: recurringSeriesInclude,
		});

		if (!existingSeries) {
			throw new BadRequestError("Recurring appointment not found");
		}

		await assertCanManageRecurringSeries(input.currentUser, existingSeries);

		const provider = await getProviderForBookingWindow(
			existingSeries.healthcareProviderId,
		);
		const bookingWindowEnd = getBookingWindowEndDate(
			provider.bookingAvailabilityDays,
		);
		const endsOn = input.recurrence.endsOn
			? parseUtcDateInput(input.recurrence.endsOn)
			: null;

		if (!input.recurrence.isIndefinite && !endsOn) {
			throw new BadRequestError(
				"Recurring appointments must define an end date or be indefinite",
			);
		}

		if (endsOn && endOfUtcDay(endsOn) < existingSeries.startsOn) {
			throw new BadRequestError(
				"Recurring appointment end date must be after the series start",
			);
		}

		const recurringSeries = await prisma.$transaction(async (tx) => {
			await cancelFutureSeriesAppointmentsTx(
				tx,
				existingSeries.id,
				input.currentUser.id,
				"Recurring appointment updated",
			);

			await tx.appointment_recurring_series_rule.deleteMany({
				where: {
					seriesId: existingSeries.id,
				},
			});

			const updatedSeries = await tx.appointment_recurring_series.update({
				where: {
					id: existingSeries.id,
				},
				data: {
					notes: input.notes ?? null,
					endsOn,
					isIndefinite: input.recurrence.isIndefinite,
					cancelledAt: null,
					isActive: true,
					generatedUntil: null,
					rules: {
						create: uniqueWeeklySlots(input.recurrence.weeklySlots),
					},
				},
				include: recurringSeriesInclude,
			});

			await syncSeriesAppointmentsTx({
				tx,
				series: updatedSeries,
				bookingWindowEnd,
				strict: true,
			});

			return updatedSeries;
		});

		return {
			recurringSeries: buildRecurringSeriesSummary(recurringSeries),
		};
	},

	async cancelSeries(seriesId: string, currentUser: user) {
		const existingSeries = await prisma.appointment_recurring_series.findUnique({
			where: { id: seriesId },
			include: recurringSeriesInclude,
		});

		if (!existingSeries) {
			throw new BadRequestError("Recurring appointment not found");
		}

		await assertCanManageRecurringSeries(currentUser, existingSeries);

		await prisma.$transaction(async (tx) => {
			await cancelFutureSeriesAppointmentsTx(
				tx,
				existingSeries.id,
				currentUser.id,
				"Recurring appointment cancelled",
			);

			await tx.appointment_recurring_series.update({
				where: {
					id: existingSeries.id,
				},
				data: {
					isActive: false,
					cancelledAt: new Date(),
				},
			});
		});
	},

	async trimProviderRecurringAppointmentsToWindow(healthcareProviderId: string) {
		const provider = await getProviderForBookingWindow(healthcareProviderId);
		const bookingWindowEnd = getBookingWindowEndDate(
			provider.bookingAvailabilityDays,
		);

		await prisma.appointment.updateMany({
			where: {
				healthcareProviderId,
				recurringSeriesId: {
					not: null,
				},
				scheduledAt: {
					gt: bookingWindowEnd,
				},
				status: {
					not: "CANCELLED",
				},
			},
			data: {
				status: "CANCELLED",
				cancellationReason:
					"Recurring appointment moved outside provider booking window",
				cancelledAt: new Date(),
			},
		});
	},

	async runWorkerSync() {
		const activeProviders = await prisma.appointment_recurring_series.findMany({
			where: {
				isActive: true,
			},
			select: {
				healthcareProviderId: true,
			},
			distinct: ["healthcareProviderId"],
		});

		for (const provider of activeProviders) {
			await this.ensureProviderRecurringAppointmentsUpToDate(
				provider.healthcareProviderId,
				getBookingWindowEndDate(DEFAULT_BOOKING_AVAILABILITY_DAYS),
			).catch((error) => {
				console.error(
					"Recurring appointments sync failed for provider:",
					provider.healthcareProviderId,
					error,
				);
			});
		}
	},
};
