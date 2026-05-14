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
		const scheduledAt = nextUpcomingUtcWeekday(1, 9, 0);
		const endsOn = new Date(scheduledAt);
		endsOn.setUTCDate(endsOn.getUTCDate() + 10);

		const result = await recurringAppointmentsService.createSeriesFromAppointment({
			currentUser: { id: "provider-1", role: "HEALTHCARE_PROVIDER" } as any,
			customerId: "customer-1",
			patientProfileId: null,
			healthcareProviderId: "provider-1",
			scheduledAt,
			serviceModality: "IN_PERSON" as any,
			notes: "Weekly therapy",
			procedureIds: ["procedure-1"],
			recurrence: {
				isIndefinite: false,
				endsOn: toDateInput(endsOn),
				weeklySlots: [{ dayOfWeek: 3, startTime: "10:00" }],
			},
		});

		expect(result.appointment.scheduledAt.toISOString()).toBe(
			scheduledAt.toISOString(),
		);
		expect(result.recurringSeries.weeklySlots).toHaveLength(2);
		expect(currentMock.state.appointments).toHaveLength(4);
		expect(
			currentMock.state.appointments
				.map((appointment) => appointment.scheduledAt.toISOString())
				.sort(),
		).toEqual([
			scheduledAt.toISOString(),
			new Date(
				Date.UTC(
					scheduledAt.getUTCFullYear(),
					scheduledAt.getUTCMonth(),
					scheduledAt.getUTCDate() + 2,
					10,
					0,
					0,
					0,
				),
			).toISOString(),
			new Date(scheduledAt.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
			new Date(
				Date.UTC(
					scheduledAt.getUTCFullYear(),
					scheduledAt.getUTCMonth(),
					scheduledAt.getUTCDate() + 9,
					10,
					0,
					0,
					0,
				),
			).toISOString(),
		].sort());
	});

	test("cancels the recurring series and future generated appointments", async () => {
		const scheduledAt = nextUpcomingUtcWeekday(1, 9, 0);
		const endsOn = new Date(scheduledAt);
		endsOn.setUTCDate(endsOn.getUTCDate() + 10);

		const created = await recurringAppointmentsService.createSeriesFromAppointment({
			currentUser: { id: "provider-1", role: "HEALTHCARE_PROVIDER" } as any,
			customerId: "customer-1",
			patientProfileId: null,
			healthcareProviderId: "provider-1",
			scheduledAt,
			serviceModality: "IN_PERSON" as any,
			notes: "Weekly therapy",
			procedureIds: ["procedure-1"],
			recurrence: {
				isIndefinite: false,
				endsOn: toDateInput(endsOn),
				weeklySlots: [{ dayOfWeek: 3, startTime: "10:00" }],
			},
		});

		await recurringAppointmentsService.cancelSeries(created.recurringSeries.id, {
			id: "provider-1",
			role: "HEALTHCARE_PROVIDER",
		} as any);

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
});
