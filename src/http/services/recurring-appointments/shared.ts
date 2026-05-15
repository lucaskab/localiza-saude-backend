import type { Prisma } from "../../../../prisma/generated/prisma/client";
import { endOfUtcDay } from "./helpers";

export const recurringSeriesInclude = {
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

export type RecurringSeriesWithRelations =
	Prisma.appointment_recurring_seriesGetPayload<{
		include: typeof recurringSeriesInclude;
	}>;

export const appointmentInclude = {
	customer: true,
	patientProfile: true,
	healthcareProvider: true,
	cancelledByUser: true,
	recurringSeries: {
		include: {
			rules: {
				orderBy: [{ dayOfWeek: "asc" as const }, { startTime: "asc" as const }],
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
							position: "asc" as const,
						},
					},
				},
			},
		},
		orderBy: {
			createdAt: "desc" as const,
		},
	},
	rescheduleRequests: {
		orderBy: {
			createdAt: "desc" as const,
		},
	},
} satisfies Prisma.appointmentInclude;

export const recurringTransactionOptions = {
	timeout: 20_000,
	maxWait: 10_000,
};

export function getSeriesGenerationEndDate(
	series: RecurringSeriesWithRelations,
	bookingWindowEnd: Date,
) {
	if (!series.endsOn) {
		return bookingWindowEnd;
	}

	const recurrenceEnd = endOfUtcDay(series.endsOn);
	return recurrenceEnd < bookingWindowEnd ? recurrenceEnd : bookingWindowEnd;
}

export function buildRecurringSeriesSummary(
	series: RecurringSeriesWithRelations,
) {
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
