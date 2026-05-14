import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { AppointmentWithRelations } from "@/http/repositories/appointments/appointments-repository-contract";
import { makeUser } from "@/http/tests/factories";

const makeAppointment = (
	overrides: Partial<AppointmentWithRelations> = {},
): AppointmentWithRelations => ({
	id: "appointment-1",
	createdAt: new Date("2026-08-01T10:00:00.000Z"),
	updatedAt: new Date("2026-08-01T10:00:00.000Z"),
	customerId: "customer-1",
	customer: makeUser({
		id: "customer-1",
		role: "CUSTOMER",
		name: "Lucas Furini",
	}),
	patientProfileId: null,
	patientProfile: null,
	healthcareProviderId: "provider-1",
	healthcareProvider: makeUser({
		id: "provider-1",
		role: "HEALTHCARE_PROVIDER",
		name: "Dra. Ana Souza",
	}),
	recurringSeriesId: null,
	recurringRuleId: null,
	recurringGeneratedAt: null,
	scheduledAt: new Date("2026-08-20T13:00:00.000Z"),
	status: "SCHEDULED",
	serviceModality: "ONLINE",
	onlineMeetingUrl: null,
	onlineMeetingProvider: null,
	onlineMeetingExternalId: null,
	onlineMeetingCreatedAt: null,
	totalDurationMinutes: 60,
	totalPriceCents: 20000,
	notes: null,
	cancellationReason: null,
	cancellationFeeCents: null,
	cancellationPolicyAppliedAt: null,
	cancelledAt: null,
	cancelledByUserId: null,
	cancelledByUser: null,
	recurringSeries: null,
	recurringRule: null,
	appointmentProcedures: [
		{
			id: "ap-1",
			appointmentId: "appointment-1",
			procedureId: "procedure-1",
			createdAt: new Date("2026-08-01T10:00:00.000Z"),
			procedure: {
				id: "procedure-1",
				name: "Consulta inicial",
				description: null,
				priceInCents: 10000,
				durationInMinutes: 60,
				healthcareProviderId: "provider-1",
				createdAt: new Date("2026-08-01T10:00:00.000Z"),
				updatedAt: new Date("2026-08-01T10:00:00.000Z"),
				checklistItems: [],
			},
		},
	],
	rescheduleRequests: [],
	...overrides,
});

const mockPushNotificationsService = {
	sendToUser: mock(() => Promise.resolve({ status: "sent" as const })),
};
const { createSendAppointmentEventNotificationUseCase } = await import(
	"./service"
);

describe("sendAppointmentEventNotificationUseCase", () => {
	const sendAppointmentEventNotificationUseCase =
		createSendAppointmentEventNotificationUseCase(mockPushNotificationsService);

	beforeEach(() => {
		mockPushNotificationsService.sendToUser.mockReset();
		mockPushNotificationsService.sendToUser.mockResolvedValue({
			status: "sent",
		});
	});

	test("sends new appointment request notification to provider", async () => {
		const appointment = makeAppointment();

		await sendAppointmentEventNotificationUseCase.sendNewAppointmentRequestToProvider(
			appointment,
		);

		expect(mockPushNotificationsService.sendToUser).toHaveBeenCalledWith(
			expect.objectContaining({
				userId: "provider-1",
				type: "NEW_APPOINTMENT_REQUEST",
				title: "Nova consulta solicitada",
				appointmentId: "appointment-1",
				data: {
					screen: "appointment",
					appointmentId: "appointment-1",
					status: "SCHEDULED",
				},
			}),
		);
	});

	test("skips status update when appointment has no customer", async () => {
		await sendAppointmentEventNotificationUseCase.sendAppointmentStatusUpdateToCustomer(
			makeAppointment({
				customer: null,
				customerId: null,
			}),
		);

		expect(mockPushNotificationsService.sendToUser).not.toHaveBeenCalled();
	});

	test("sends status update notification to customer", async () => {
		await sendAppointmentEventNotificationUseCase.sendAppointmentStatusUpdateToCustomer(
			makeAppointment({
				status: "CONFIRMED",
			}),
		);

		expect(mockPushNotificationsService.sendToUser).toHaveBeenCalledWith(
			expect.objectContaining({
				userId: "customer-1",
				type: "APPOINTMENT_STATUS_UPDATE",
				title: "Atualizacao da consulta",
				appointmentId: "appointment-1",
				data: {
					screen: "appointment",
					appointmentId: "appointment-1",
					status: "CONFIRMED",
				},
			}),
		);
	});
});
