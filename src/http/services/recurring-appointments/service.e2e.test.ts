import { beforeEach, describe, expect, mock, test } from "bun:test";

type TestProcedure = {
	id: string;
	healthcareProviderId: string;
	name: string;
	durationInMinutes: number;
	priceInCents: number;
	checklistItems: unknown[];
};

type TestRule = {
	id: string;
	seriesId: string;
	dayOfWeek: number;
	startTime: string;
};

type TestSeries = {
	id: string;
	customerId: string | null;
	patientProfileId: string | null;
	healthcareProviderId: string;
	createdByUserId: string;
	serviceModality: string;
	notes: string | null;
	startsOn: Date;
	endsOn: Date | null;
	isIndefinite: boolean;
	isActive: boolean;
	generatedUntil: Date | null;
	cancelledAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
};

type TestSeriesProcedure = {
	id: string;
	seriesId: string;
	procedureId: string;
};

type TestAppointment = {
	id: string;
	customerId: string | null;
	patientProfileId: string | null;
	healthcareProviderId: string;
	recurringSeriesId: string | null;
	recurringRuleId: string | null;
	recurringGeneratedAt: Date | null;
	scheduledAt: Date;
	serviceModality: string;
	notes: string | null;
	totalDurationMinutes: number;
	totalPriceCents: number;
	status: string;
	cancellationReason: string | null;
	cancelledAt: Date | null;
	cancelledByUserId?: string | null;
};

type TestAppointmentProcedure = {
	id: string;
	appointmentId: string;
	procedureId: string;
	createdAt: Date;
};

type TestSchedule = {
	id: string;
	healthcareProviderId: string;
	dayOfWeek: number;
	startTime: string;
	endTime: string;
	isActive: boolean;
};

type TestException = {
	id: string;
	healthcareProviderId: string;
	date: Date;
	type: string;
	startTime: string | null;
	endTime: string | null;
	isActive: boolean;
};

function nextUpcomingUtcWeekday(dayOfWeek: number, hours: number, minutes: number) {
	const now = new Date();
	const candidate = new Date(
		Date.UTC(
			now.getUTCFullYear(),
			now.getUTCMonth(),
			now.getUTCDate(),
			hours,
			minutes,
			0,
			0,
		),
	);

	while (candidate.getUTCDay() !== dayOfWeek || candidate <= now) {
		candidate.setUTCDate(candidate.getUTCDate() + 1);
	}

	return candidate;
}

function toDateInput(date: Date) {
	return date.toISOString().slice(0, 10);
}

function createProviderActor() {
	return {
		id: "provider-1",
		role: "HEALTHCARE_PROVIDER",
	} as Parameters<typeof recurringAppointmentsService.cancelSeries>[1];
}

function createRecurringAppointmentInput(
	overrides: Partial<Parameters<
		typeof recurringAppointmentsService.createSeriesFromAppointment
	>[0]> = {},
) {
	const scheduledAt = nextUpcomingUtcWeekday(1, 9, 0);
	const endsOn = new Date(scheduledAt);
	endsOn.setUTCDate(endsOn.getUTCDate() + 10);

	return {
		currentUser: createProviderActor(),
		customerId: "customer-1",
		patientProfileId: null,
		healthcareProviderId: "provider-1",
		scheduledAt,
		serviceModality:
			"IN_PERSON" as Parameters<
				typeof recurringAppointmentsService.createSeriesFromAppointment
			>[0]["serviceModality"],
		notes: "Weekly therapy",
		procedureIds: ["procedure-1"],
		recurrence: {
			isIndefinite: false,
			endsOn: toDateInput(endsOn),
			weeklySlots: [{ dayOfWeek: 3, startTime: "10:00" }],
		},
		...overrides,
	};
}

function createMockPrisma() {
	const provider = {
		id: "provider-1",
		role: "HEALTHCARE_PROVIDER",
		bookingAvailabilityDays: 30,
	};

	const state: {
		provider: typeof provider;
		procedures: TestProcedure[];
		schedules: TestSchedule[];
		exceptions: TestException[];
		series: TestSeries[];
		rules: TestRule[];
		seriesProcedures: TestSeriesProcedure[];
		appointments: TestAppointment[];
		appointmentProcedures: TestAppointmentProcedure[];
		counters: Record<string, number>;
	} = {
		provider,
		procedures: [
			{
				id: "procedure-1",
				healthcareProviderId: provider.id,
				name: "Therapy Session",
				durationInMinutes: 60,
				priceInCents: 15000,
				checklistItems: [],
			},
		],
		schedules: [
			{
				id: "schedule-1",
				healthcareProviderId: provider.id,
				dayOfWeek: 1,
				startTime: "08:00",
				endTime: "12:00",
				isActive: true,
			},
			{
				id: "schedule-2",
				healthcareProviderId: provider.id,
				dayOfWeek: 3,
				startTime: "09:00",
				endTime: "12:00",
				isActive: true,
			},
		],
		exceptions: [],
		series: [],
		rules: [],
		seriesProcedures: [],
		appointments: [],
		appointmentProcedures: [],
		counters: {
			series: 1,
			rule: 1,
			seriesProcedure: 1,
			appointment: 1,
			appointmentProcedure: 1,
		},
	};

	const nextId = (key: keyof typeof state.counters) => {
		const current = state.counters[key] ?? 1;
		state.counters[key] = current + 1;
		return `${key}-${current}`;
	};

	const buildSeriesWithRelations = (series: TestSeries) => ({
		...series,
		customer: series.customerId ? { id: series.customerId } : null,
		patientProfile: null,
		healthcareProvider: state.provider,
		rules: state.rules
			.filter((rule) => rule.seriesId === series.id)
			.sort((a, b) =>
				a.dayOfWeek === b.dayOfWeek
					? a.startTime.localeCompare(b.startTime)
					: a.dayOfWeek - b.dayOfWeek,
			),
		procedures: state.seriesProcedures
			.filter((item) => item.seriesId === series.id)
			.map((item) => ({
				...item,
				procedure: state.procedures.find(
					(procedure) => procedure.id === item.procedureId,
				)!,
			})),
	});

	const buildAppointmentWithRelations = (appointment: TestAppointment) => ({
		...appointment,
		customer: appointment.customerId ? { id: appointment.customerId } : null,
		patientProfile: null,
		healthcareProvider: state.provider,
		cancelledByUser: appointment.cancelledByUserId
			? { id: appointment.cancelledByUserId }
			: null,
		recurringSeries: appointment.recurringSeriesId
			? {
					...buildSeriesWithRelations(
						state.series.find((series) => series.id === appointment.recurringSeriesId)!,
					),
					rules: state.rules
						.filter((rule) => rule.seriesId === appointment.recurringSeriesId)
						.sort((a, b) =>
							a.dayOfWeek === b.dayOfWeek
								? a.startTime.localeCompare(b.startTime)
								: a.dayOfWeek - b.dayOfWeek,
						),
				}
			: null,
		recurringRule: appointment.recurringRuleId
			? state.rules.find((rule) => rule.id === appointment.recurringRuleId) ?? null
			: null,
		appointmentProcedures: state.appointmentProcedures
			.filter((item) => item.appointmentId === appointment.id)
			.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
			.map((item) => ({
				...item,
				procedure: state.procedures.find(
					(procedure) => procedure.id === item.procedureId,
				)!,
			})),
		rescheduleRequests: [],
	});

	const tx = {
		procedure: {
			findMany: async ({ where }: any) =>
				state.procedures.filter(
					(procedure) =>
						where.id.in.includes(procedure.id) &&
						procedure.healthcareProviderId === where.healthcareProviderId,
				),
		},
		healthcare_provider_schedule: {
			findMany: async ({ where, select }: any) =>
				state.schedules
					.filter(
						(schedule) =>
							schedule.healthcareProviderId === where.healthcareProviderId &&
							schedule.isActive === where.isActive,
					)
					.map((schedule) =>
						select
							? {
									dayOfWeek: schedule.dayOfWeek,
									startTime: schedule.startTime,
									endTime: schedule.endTime,
								}
							: schedule,
					),
		},
		healthcare_provider_schedule_exception: {
			findMany: async ({ where, select }: any) =>
				state.exceptions
					.filter(
						(exception) =>
							exception.healthcareProviderId === where.healthcareProviderId &&
							exception.isActive === where.isActive &&
							exception.date >= where.date.gte &&
							exception.date <= where.date.lte,
					)
					.map((exception) =>
						select
							? {
									date: exception.date,
									type: exception.type,
									startTime: exception.startTime,
									endTime: exception.endTime,
								}
							: exception,
					),
		},
		appointment_recurring_series: {
			create: async ({ data }: any) => {
				const now = new Date();
				const series: TestSeries = {
					id: nextId("series"),
					customerId: data.customerId ?? null,
					patientProfileId: data.patientProfileId ?? null,
					healthcareProviderId: data.healthcareProviderId,
					createdByUserId: data.createdByUserId,
					serviceModality: data.serviceModality,
					notes: data.notes ?? null,
					startsOn: data.startsOn,
					endsOn: data.endsOn ?? null,
					isIndefinite: data.isIndefinite,
					isActive: true,
					generatedUntil: null,
					cancelledAt: null,
					createdAt: now,
					updatedAt: now,
				};

				state.series.push(series);

				for (const rule of data.rules.create) {
					state.rules.push({
						id: nextId("rule"),
						seriesId: series.id,
						dayOfWeek: rule.dayOfWeek,
						startTime: rule.startTime,
					});
				}

				for (const item of data.procedures.create) {
					state.seriesProcedures.push({
						id: nextId("seriesProcedure"),
						seriesId: series.id,
						procedureId: item.procedureId,
					});
				}

				return buildSeriesWithRelations(series);
			},
			update: async ({ where, data }: any) => {
				const series = state.series.find((item) => item.id === where.id);
				if (!series) {
					throw new Error("Series not found");
				}

				if (data.rules?.create) {
					for (const rule of data.rules.create) {
						state.rules.push({
							id: nextId("rule"),
							seriesId: series.id,
							dayOfWeek: rule.dayOfWeek,
							startTime: rule.startTime,
						});
					}
				}

				Object.assign(series, data, { updatedAt: new Date() });
				return buildSeriesWithRelations(series);
			},
		},
		appointment: {
			findMany: async ({ where }: any) =>
				state.appointments
					.filter((appointment) => {
						if (
							appointment.healthcareProviderId !== where.healthcareProviderId
						) {
							return false;
						}

						if (appointment.scheduledAt < where.scheduledAt.gte) {
							return false;
						}

						if (appointment.scheduledAt > where.scheduledAt.lte) {
							return false;
						}

						if (
							where.status?.not &&
							appointment.status === where.status.not
						) {
							return false;
						}

						return true;
					})
					.sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())
					.map((appointment) => ({
						id: appointment.id,
						recurringSeriesId: appointment.recurringSeriesId,
						scheduledAt: appointment.scheduledAt,
						totalDurationMinutes: appointment.totalDurationMinutes,
					})),
			create: async ({ data }: any) => {
				const appointment: TestAppointment = {
					id: nextId("appointment"),
					customerId: data.customerId ?? null,
					patientProfileId: data.patientProfileId ?? null,
					healthcareProviderId: data.healthcareProviderId,
					recurringSeriesId: data.recurringSeriesId ?? null,
					recurringRuleId: data.recurringRuleId ?? null,
					recurringGeneratedAt: data.recurringGeneratedAt ?? null,
					scheduledAt: data.scheduledAt,
					serviceModality: data.serviceModality,
					notes: data.notes ?? null,
					totalDurationMinutes: data.totalDurationMinutes,
					totalPriceCents: data.totalPriceCents,
					status: data.status,
					cancellationReason: null,
					cancelledAt: null,
					cancelledByUserId: null,
				};

				state.appointments.push(appointment);

				for (const item of data.appointmentProcedures.create) {
					state.appointmentProcedures.push({
						id: nextId("appointmentProcedure"),
						appointmentId: appointment.id,
						procedureId: item.procedureId,
						createdAt: new Date(),
					});
				}

				return {
					id: appointment.id,
					recurringSeriesId: appointment.recurringSeriesId,
					scheduledAt: appointment.scheduledAt,
					totalDurationMinutes: appointment.totalDurationMinutes,
				};
			},
			findFirst: async ({ where }: any) => {
				const appointment = state.appointments.find(
					(item) =>
						item.recurringSeriesId === where.recurringSeriesId &&
						item.scheduledAt.toISOString() === where.scheduledAt.toISOString(),
				);

				return appointment ? buildAppointmentWithRelations(appointment) : null;
			},
			updateMany: async ({ where, data }: any) => {
				let count = 0;

				for (const appointment of state.appointments) {
					if (appointment.recurringSeriesId !== where.recurringSeriesId) {
						continue;
					}

					if (appointment.scheduledAt < where.scheduledAt.gte) {
						continue;
					}

					if (
						where.status?.not &&
						appointment.status === where.status.not
					) {
						continue;
					}

					Object.assign(appointment, data);
					count += 1;
				}

				return { count };
			},
		},
		appointment_recurring_series_rule: {
			deleteMany: async ({ where }: any) => {
				state.rules = state.rules.filter((rule) => rule.seriesId !== where.seriesId);
				return { count: 0 };
			},
		},
	};

	const prisma = {
		user: {
			findFirst: async ({ where }: any) =>
				where.id === state.provider.id && where.role === state.provider.role
					? state.provider
					: null,
		},
		appointment_recurring_series: {
			findUnique: async ({ where }: any) => {
				const series = state.series.find((item) => item.id === where.id);
				return series ? buildSeriesWithRelations(series) : null;
			},
			findMany: async ({ where, select }: any) => {
				const rows = state.series.filter((series) => {
					if (where?.isActive !== undefined && series.isActive !== where.isActive) {
						return false;
					}
					if (
						where?.healthcareProviderId &&
						series.healthcareProviderId !== where.healthcareProviderId
					) {
						return false;
					}
					if (where?.startsOn?.lte && series.startsOn > where.startsOn.lte) {
						return false;
					}
					return true;
				});

				if (select?.healthcareProviderId) {
					return rows.map((series) => ({
						healthcareProviderId: series.healthcareProviderId,
					}));
				}

				return rows.map((series) => buildSeriesWithRelations(series));
			},
		},
		appointment: {
			updateMany: tx.appointment.updateMany,
			findUnique: async ({ where }: any) => {
				const appointment = state.appointments.find((item) => item.id === where.id);
				return appointment ? buildAppointmentWithRelations(appointment) : null;
			},
		},
		$transaction: async (callback: (txClient: typeof tx) => Promise<unknown>) =>
			callback(tx),
	};

	return { prisma, state };
}

let currentMock = createMockPrisma();

const prismaProxy = new Proxy(
	{},
	{
		get(_target, property) {
			return currentMock.prisma[property as keyof typeof currentMock.prisma];
		},
	},
);

mock.module("@/database/prisma", () => ({
	prisma: prismaProxy,
}));

mock.module("@/http/services/clinic-rbac", () => ({
	clinicRbac: {
		assertCanManageProvider: async () => undefined,
	},
}));

const { recurringAppointmentsService } = await import("./service");

describe("recurringAppointmentsService e2e", () => {
	beforeEach(() => {
		currentMock = createMockPrisma();
	});

	test("creates recurring occurrences across weekly slots inside the provider booking window", async () => {
		const input = createRecurringAppointmentInput();

		const result = await recurringAppointmentsService.createSeriesFromAppointment(input);

		expect(result.appointment.scheduledAt.toISOString()).toBe(
			input.scheduledAt.toISOString(),
		);
		expect(result.recurringSeries.weeklySlots).toHaveLength(2);
		expect(currentMock.state.appointments).toHaveLength(4);
		expect(
			currentMock.state.appointments
				.map((appointment) => appointment.scheduledAt.toISOString())
				.sort(),
		).toEqual([
			input.scheduledAt.toISOString(),
			new Date(
				Date.UTC(
					input.scheduledAt.getUTCFullYear(),
					input.scheduledAt.getUTCMonth(),
					input.scheduledAt.getUTCDate() + 2,
					10,
					0,
					0,
					0,
				),
			).toISOString(),
			new Date(
				input.scheduledAt.getTime() + 7 * 24 * 60 * 60 * 1000,
			).toISOString(),
			new Date(
				Date.UTC(
					input.scheduledAt.getUTCFullYear(),
					input.scheduledAt.getUTCMonth(),
					input.scheduledAt.getUTCDate() + 9,
					10,
					0,
					0,
					0,
				),
			).toISOString(),
		].sort());
	});

	test("cancels the recurring series and future generated appointments", async () => {
		const created = await recurringAppointmentsService.createSeriesFromAppointment(
			createRecurringAppointmentInput(),
		);

		await recurringAppointmentsService.cancelSeries(
			created.recurringSeries.id,
			createProviderActor(),
		);

		const cancelledSeries = currentMock.state.series.find(
			(series) => series.id === created.recurringSeries.id,
		);
		expect(cancelledSeries?.isActive).toBe(false);
		expect(cancelledSeries?.cancelledAt).toBeInstanceOf(Date);
		expect(
			currentMock.state.appointments.every(
				(appointment) => appointment.status === "CANCELLED",
			),
		).toBe(true);
	});

	test("requires an end date when the recurrence is not indefinite", async () => {
		const input = createRecurringAppointmentInput({
			recurrence: {
				isIndefinite: false,
				endsOn: null,
				weeklySlots: [{ dayOfWeek: 3, startTime: "10:00" }],
			},
		});

		await expect(
			recurringAppointmentsService.createSeriesFromAppointment(input),
		).rejects.toThrow(
			"Recurring appointments must define an end date or be indefinite",
		);
	});

	test("rejects a recurrence whose end date is before the first occurrence", async () => {
		const scheduledAt = nextUpcomingUtcWeekday(1, 9, 0);
		const dayBefore = new Date(scheduledAt);
		dayBefore.setUTCDate(dayBefore.getUTCDate() - 1);

		const input = createRecurringAppointmentInput({
			scheduledAt,
			recurrence: {
				isIndefinite: false,
				endsOn: toDateInput(dayBefore),
				weeklySlots: [{ dayOfWeek: 3, startTime: "10:00" }],
			},
		});

		await expect(
			recurringAppointmentsService.createSeriesFromAppointment(input),
		).rejects.toThrow(
			"Recurring appointment end date must be after the first occurrence",
		);
	});

	test("rejects recurring slots that do not fit the provider schedule in strict mode", async () => {
		const input = createRecurringAppointmentInput({
			recurrence: {
				isIndefinite: false,
				endsOn: createRecurringAppointmentInput().recurrence.endsOn,
				weeklySlots: [{ dayOfWeek: 3, startTime: "13:30" }],
			},
		});

		await expect(
			recurringAppointmentsService.createSeriesFromAppointment(input),
		).rejects.toThrow("Recurring appointment does not fit provider schedule");
	});

	test("rejects recurring slots that overlap another booking in strict mode", async () => {
		const input = createRecurringAppointmentInput();
		const conflictingDate = new Date(
			Date.UTC(
				input.scheduledAt.getUTCFullYear(),
				input.scheduledAt.getUTCMonth(),
				input.scheduledAt.getUTCDate() + 2,
				10,
				0,
				0,
				0,
			),
		);

		currentMock.state.appointments.push({
			id: "existing-conflict",
			customerId: "customer-2",
			patientProfileId: null,
			healthcareProviderId: "provider-1",
			recurringSeriesId: null,
			recurringRuleId: null,
			recurringGeneratedAt: null,
			scheduledAt: conflictingDate,
			serviceModality: "IN_PERSON",
			notes: null,
			totalDurationMinutes: 60,
			totalPriceCents: 12000,
			status: "SCHEDULED",
			cancellationReason: null,
			cancelledAt: null,
			cancelledByUserId: null,
		});

		await expect(
			recurringAppointmentsService.createSeriesFromAppointment(input),
		).rejects.toThrow("Recurring appointment conflicts with another booking");
	});

	test("updates a recurring series by cancelling future occurrences and regenerating the new rule set", async () => {
		const created = await recurringAppointmentsService.createSeriesFromAppointment(
			createRecurringAppointmentInput(),
		);

		const updated = await recurringAppointmentsService.updateSeries(
			created.recurringSeries.id,
			{
				currentUser: createProviderActor(),
				notes: "Updated weekly therapy",
				recurrence: {
					isIndefinite: false,
					endsOn: created.recurringSeries.endsOn?.toISOString().slice(0, 10) || null,
					weeklySlots: [{ dayOfWeek: 3, startTime: "11:00" }],
				},
			},
		);

		const scheduledAppointments = currentMock.state.appointments.filter(
			(appointment) =>
				appointment.recurringSeriesId === created.recurringSeries.id &&
				appointment.status === "SCHEDULED",
		);
		const cancelledAppointments = currentMock.state.appointments.filter(
			(appointment) =>
				appointment.recurringSeriesId === created.recurringSeries.id &&
				appointment.status === "CANCELLED",
		);

		expect(updated.recurringSeries.weeklySlots).toEqual([
			expect.objectContaining({ dayOfWeek: 3, startTime: "11:00" }),
		]);
		expect(cancelledAppointments.length).toBeGreaterThan(0);
		expect(scheduledAppointments.length).toBeGreaterThan(0);
		expect(
			scheduledAppointments.every(
				(appointment) =>
					appointment.scheduledAt.getUTCDay() === 3 &&
					appointment.scheduledAt.toISOString().slice(11, 16) === "11:00",
			),
		).toBe(true);
	});

	test("keeps an indefinite recurring series inside the provider booking window", async () => {
		currentMock.state.provider.bookingAvailabilityDays = 14;
		const created = await recurringAppointmentsService.createSeriesFromAppointment(
			createRecurringAppointmentInput({
				recurrence: {
					isIndefinite: true,
					endsOn: null,
					weeklySlots: [{ dayOfWeek: 3, startTime: "10:00" }],
				},
			}),
		);

		const series = currentMock.state.series.find(
			(item) => item.id === created.recurringSeries.id,
		);
		const latestAppointment = currentMock.state.appointments
			.filter((appointment) => appointment.recurringSeriesId === created.recurringSeries.id)
			.sort((a, b) => b.scheduledAt.getTime() - a.scheduledAt.getTime())[0];

		expect(series?.generatedUntil).toBeInstanceOf(Date);
		expect(latestAppointment).toBeDefined();
		expect(latestAppointment!.scheduledAt <= series!.generatedUntil!).toBe(true);
	});

	test("syncs future occurrences up to a later target date without duplicating existing ones", async () => {
		currentMock.state.provider.bookingAvailabilityDays = 7;
		const created = await recurringAppointmentsService.createSeriesFromAppointment(
			createRecurringAppointmentInput({
				recurrence: {
					isIndefinite: true,
					endsOn: null,
					weeklySlots: [{ dayOfWeek: 3, startTime: "10:00" }],
				},
			}),
		);
		const initialCount = currentMock.state.appointments.length;

		currentMock.state.provider.bookingAvailabilityDays = 30;

		await recurringAppointmentsService.ensureProviderRecurringAppointmentsUpToDate(
			"provider-1",
			new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
		);

		const generatedAppointments = currentMock.state.appointments.filter(
			(appointment) => appointment.recurringSeriesId === created.recurringSeries.id,
		);
		const uniqueOccurrenceCount = new Set(
			generatedAppointments.map((appointment) => appointment.scheduledAt.toISOString()),
		).size;

		expect(generatedAppointments.length).toBeGreaterThan(initialCount);
		expect(generatedAppointments).toHaveLength(uniqueOccurrenceCount);
	});

	test("skips conflicting future occurrences during background sync instead of failing the whole series", async () => {
		currentMock.state.provider.bookingAvailabilityDays = 7;
		const created = await recurringAppointmentsService.createSeriesFromAppointment(
			createRecurringAppointmentInput({
				recurrence: {
					isIndefinite: true,
					endsOn: null,
					weeklySlots: [{ dayOfWeek: 3, startTime: "10:00" }],
				},
			}),
		);

		currentMock.state.provider.bookingAvailabilityDays = 30;
		const futureWednesday = currentMock.state.appointments
			.filter((appointment) => appointment.recurringSeriesId === created.recurringSeries.id)
			.map((appointment) => appointment.scheduledAt)
			.sort((a, b) => a.getTime() - b.getTime())
			.pop()!;
		const conflictingFutureDate = new Date(futureWednesday);
		conflictingFutureDate.setUTCDate(conflictingFutureDate.getUTCDate() + 7);
		conflictingFutureDate.setUTCHours(10, 0, 0, 0);

		currentMock.state.appointments.push({
			id: "sync-conflict",
			customerId: "customer-2",
			patientProfileId: null,
			healthcareProviderId: "provider-1",
			recurringSeriesId: null,
			recurringRuleId: null,
			recurringGeneratedAt: null,
			scheduledAt: conflictingFutureDate,
			serviceModality: "IN_PERSON",
			notes: null,
			totalDurationMinutes: 60,
			totalPriceCents: 12000,
			status: "SCHEDULED",
			cancellationReason: null,
			cancelledAt: null,
			cancelledByUserId: null,
		});

		await recurringAppointmentsService.ensureProviderRecurringAppointmentsUpToDate(
			"provider-1",
			new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
		);

		const seriesAppointments = currentMock.state.appointments.filter(
			(appointment) =>
				appointment.recurringSeriesId === created.recurringSeries.id &&
				appointment.scheduledAt.toISOString() === conflictingFutureDate.toISOString(),
		);

		expect(seriesAppointments).toHaveLength(0);
	});
});
