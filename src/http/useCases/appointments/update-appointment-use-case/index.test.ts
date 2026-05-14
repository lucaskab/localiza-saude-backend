import { beforeEach, describe, expect, mock, test } from "bun:test";
import type {
	AppointmentWithRelations,
	UpdateAppointmentData,
} from "@/http/repositories/appointments/appointments-repository-contract";
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
	}),
	patientProfileId: null,
	patientProfile: null,
	healthcareProviderId: "provider-1",
	recurringSeriesId: null,
	recurringRuleId: null,
	recurringGeneratedAt: null,
	scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
	serviceModality: "ONLINE",
	onlineMeetingUrl: null,
	onlineMeetingProvider: null,
	onlineMeetingExternalId: null,
	onlineMeetingCreatedAt: null,
	totalDurationMinutes: 60,
	totalPriceCents: 20000,
	status: "SCHEDULED",
	notes: null,
	cancellationReason: null,
	cancellationFeeCents: null,
	cancellationPolicyAppliedAt: null,
	cancelledAt: null,
	cancelledByUserId: null,
	healthcareProvider: {
		...makeUser({
			id: "provider-1",
			role: "HEALTHCARE_PROVIDER",
		}),
		cancellationPolicyEnabled: true,
		cancellationPolicyHoursBefore: 24,
		cancellationPolicyPenaltyType: "FIXED",
		cancellationPolicyFixedFeeCents: 5000,
		cancellationPolicyPercentage: null,
		cancellationPolicyRequiresJustification: true,
	},
	cancelledByUser: null,
	recurringSeries: null,
	recurringRule: null,
	appointmentProcedures: [],
	rescheduleRequests: [],
	...overrides,
});

const baseAppointment = makeAppointment();

const mockAppointmentRepository = {
	findById: mock((_: string): Promise<AppointmentWithRelations | null> =>
		Promise.resolve(baseAppointment),
	),
	update: mock(
		(_: string, data: UpdateAppointmentData): Promise<AppointmentWithRelations> =>
			Promise.resolve(
				makeAppointment({
					...baseAppointment,
					...data,
					status: data.status ?? "CONFIRMED",
				}),
			),
	),
};

const mockClinicRbac = {
	assertCanManageProvider: mock(() => Promise.resolve(undefined)),
};

const mockGoogleMeetService = {
	ensureOnlineMeeting: mock(
		(
			appointment: AppointmentWithRelations,
		): Promise<AppointmentWithRelations> =>
			Promise.resolve({
				...appointment,
				onlineMeetingUrl: "https://meet.google.com/test",
			}),
	),
};

const mockWaitlistNotifier = {
	execute: mock(() => Promise.resolve(undefined)),
};

const mockNotificationUseCase = {
	sendNewAppointmentRequestToProvider: mock(() => Promise.resolve(undefined)),
	sendAppointmentStatusUpdateToCustomer: mock(() => Promise.resolve(undefined)),
};

mock.module(
	"@/http/repositories/appointments/appointments-repository-implementation",
	() => ({
		prismaAppointmentRepository: mockAppointmentRepository,
	}),
);

mock.module("@/http/services/clinic-rbac", () => ({
	clinicRbac: mockClinicRbac,
}));

mock.module("@/http/services/google-meet-service", () => ({
	googleMeetService: mockGoogleMeetService,
}));

mock.module(
	"@/http/useCases/appointment-waitlist/notify-waitlist-slot-available-use-case",
	() => ({
		notifyWaitlistSlotAvailableUseCase: mockWaitlistNotifier,
	}),
);

mock.module(
	"@/http/useCases/notifications/send-appointment-event-notification-use-case",
	() => ({
		sendAppointmentEventNotificationUseCase: mockNotificationUseCase,
	}),
);

const { updateAppointmentUseCase } = await import("./index");

describe("updateAppointmentUseCase", () => {
	beforeEach(() => {
		mockAppointmentRepository.findById.mockReset();
		mockAppointmentRepository.update.mockReset();
		mockClinicRbac.assertCanManageProvider.mockReset();
		mockGoogleMeetService.ensureOnlineMeeting.mockReset();
		mockWaitlistNotifier.execute.mockReset();
		mockNotificationUseCase.sendAppointmentStatusUpdateToCustomer.mockReset();

		mockAppointmentRepository.findById.mockResolvedValue(
			makeAppointment({
				scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
			}),
		);
		mockAppointmentRepository.update.mockImplementation(
			async (_id: string, data: UpdateAppointmentData) =>
				makeAppointment({
					...baseAppointment,
					scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
					...data,
				}),
		);
		mockClinicRbac.assertCanManageProvider.mockResolvedValue(undefined);
		mockGoogleMeetService.ensureOnlineMeeting.mockImplementation(
			(appointment: AppointmentWithRelations): Promise<AppointmentWithRelations> =>
				Promise.resolve({
					...appointment,
					onlineMeetingUrl: "https://meet.google.com/test",
				}),
		);
		mockWaitlistNotifier.execute.mockResolvedValue(undefined);
		mockNotificationUseCase.sendAppointmentStatusUpdateToCustomer.mockResolvedValue(
			undefined,
		);
	});

	test("requires cancellation justification when provider policy demands it", async () => {
		await expect(
			updateAppointmentUseCase.execute(
				makeUser({ id: "customer-1", role: "CUSTOMER" }),
				"appointment-1",
				{
					status: "CANCELLED",
					cancellationReason: "   ",
				},
			),
		).rejects.toThrow(
			"Cancellation justification is required for this provider policy",
		);
	});

	test("confirms appointment, creates google meet and notifies customer", async () => {
		const actor = makeUser({
			id: "provider-1",
			role: "HEALTHCARE_PROVIDER",
		});

		const result = await updateAppointmentUseCase.execute(
			actor,
			"appointment-1",
			{
				status: "CONFIRMED",
			},
		);

		expect(mockAppointmentRepository.update).toHaveBeenCalledWith(
			"appointment-1",
			{ status: "CONFIRMED" },
		);
		expect(mockGoogleMeetService.ensureOnlineMeeting).toHaveBeenCalledTimes(1);
		expect(
			mockNotificationUseCase.sendAppointmentStatusUpdateToCustomer,
		).toHaveBeenCalledTimes(1);
		expect(result.appointment.onlineMeetingUrl).toBe(
			"https://meet.google.com/test",
		);
	});

	test("applies cancellation metadata and notifies waitlist", async () => {
		await updateAppointmentUseCase.execute(
			makeUser({ id: "customer-1", role: "CUSTOMER" }),
			"appointment-1",
			{
				status: "CANCELLED",
				cancellationReason: "Need to reschedule",
			},
		);

		expect(mockAppointmentRepository.update).toHaveBeenCalledWith(
			"appointment-1",
			expect.objectContaining({
				status: "CANCELLED",
				cancellationReason: "Need to reschedule",
				cancellationFeeCents: 5000,
				cancelledByUserId: "customer-1",
			}),
		);
		expect(mockWaitlistNotifier.execute).toHaveBeenCalledTimes(1);
	});
});
