import { expect, test } from "bun:test";
import { presentAppointment } from "./appointment";
import { makeUser } from "../tests/factories";

test("presentAppointment removes private user fields and maps recurring rules", () => {
	const appointment = {
		id: "appointment-1",
		customerId: "customer-1",
		customer: makeUser({
			id: "customer-1",
			role: "CUSTOMER",
			cpf: "12345678910",
			dateOfBirth: new Date("1994-02-14T00:00:00.000Z"),
		}),
		patientProfileId: null,
		patientProfile: null,
		healthcareProviderId: "provider-1",
		healthcareProvider: makeUser({
			id: "provider-1",
			role: "HEALTHCARE_PROVIDER",
			displayName: "Dr. Test",
			document: "123.456.789-10",
			birthDate: new Date("1990-01-01T00:00:00.000Z"),
			serviceModalities: ["ONLINE"],
			licenseDocumentKey: "provider-verification/provider-1/license.pdf",
			verificationStatus: "VERIFIED",
			verifiedAt: new Date("2026-01-01T00:00:00.000Z"),
		}),
		scheduledAt: new Date("2026-06-06T10:00:00.000Z"),
		status: "SCHEDULED",
		serviceModality: "ONLINE",
		onlineMeetingUrl: null,
		onlineMeetingProvider: null,
		onlineMeetingExternalId: null,
		onlineMeetingCreatedAt: null,
		totalDurationMinutes: 60,
		totalPriceCents: 15000,
		notes: null,
		cancellationReason: null,
		cancellationFeeCents: null,
		cancellationPolicyAppliedAt: null,
		cancelledAt: null,
		cancelledByUserId: null,
		cancelledByUser: makeUser({
			id: "admin-1",
			role: "ADMIN",
			verificationStatus: "PENDING",
			verifiedByUserId: "admin-1",
		}),
		recurringSeriesId: "series-1",
		recurringSeries: {
			id: "series-1",
			customerId: "customer-1",
			patientProfileId: null,
			healthcareProviderId: "provider-1",
			createdByUserId: "provider-1",
			serviceModality: "ONLINE",
			notes: null,
			startsOn: new Date("2026-06-06T10:00:00.000Z"),
			endsOn: null,
			isIndefinite: true,
			isActive: true,
			generatedUntil: null,
			cancelledAt: null,
			createdAt: new Date("2026-06-01T10:00:00.000Z"),
			updatedAt: new Date("2026-06-01T10:00:00.000Z"),
			rules: [
				{
					id: "rule-1",
					seriesId: "series-1",
					dayOfWeek: 1,
					startTime: "10:00",
					createdAt: new Date("2026-06-01T10:00:00.000Z"),
					updatedAt: new Date("2026-06-01T10:00:00.000Z"),
				},
			],
		},
		recurringRuleId: "rule-1",
		recurringRule: {
			id: "rule-1",
			seriesId: "series-1",
			dayOfWeek: 1,
			startTime: "10:00",
			createdAt: new Date("2026-06-01T10:00:00.000Z"),
			updatedAt: new Date("2026-06-01T10:00:00.000Z"),
		},
		recurringGeneratedAt: null,
		createdAt: new Date("2026-06-01T10:00:00.000Z"),
		updatedAt: new Date("2026-06-01T10:00:00.000Z"),
		appointmentProcedures: [],
		rescheduleRequests: [],
	};

	const result = presentAppointment(appointment);

	expect(result.customer).not.toHaveProperty("verificationStatus");
	expect(result.customer).not.toHaveProperty("licenseDocumentKey");
	expect(result.customer).toHaveProperty("cpf", "12345678910");
	expect(result.healthcareProvider).not.toHaveProperty("verificationStatus");
	expect(result.healthcareProvider).not.toHaveProperty("licenseDocumentKey");
	expect(result.healthcareProvider).toHaveProperty("displayName", "Dr. Test");
	expect(result.cancelledByUser).not.toHaveProperty("verificationStatus");
	expect((result.recurringSeries as any)?.weeklySlots).toHaveLength(1);
	expect((result.recurringSeries as any)?.weeklySlots[0]).toEqual({
		id: "rule-1",
		seriesId: "series-1",
		dayOfWeek: 1,
		startTime: "10:00",
		createdAt: new Date("2026-06-01T10:00:00.000Z"),
		updatedAt: new Date("2026-06-01T10:00:00.000Z"),
	});
});
