import { beforeEach, describe, expect, mock, test } from "bun:test";
import { makeUser } from "@/http/tests/factories";
import type { CreateAppointmentData } from "@/http/repositories/appointments/appointments-repository-contract";

type ExistingAppointmentWindow = {
	scheduledAt: Date;
	totalDurationMinutes: number;
};

type CreatedAppointment = {
	id: string;
	totalDurationMinutes: number;
} & CreateAppointmentData;

const mockAppointmentRepository = {
	findByProfessionalAndDateRange: mock(
		(): Promise<ExistingAppointmentWindow[]> => Promise.resolve([]),
	),
	create: mock((data: CreateAppointmentData) =>
		Promise.resolve({
			id: "appointment-1",
			totalDurationMinutes: 60,
			...data,
		}),
	),
	existsByPatientProfileAndHealthcareProvider: mock(() => Promise.resolve(false)),
};

type CustomerActor = { id: string } | null;

const mockCustomerRepository = {
	findByUserId: mock((): Promise<CustomerActor> => Promise.resolve({ id: "customer-1" })),
};

type ProviderRecord = {
	id: string;
	serviceModalities: string[];
	bookingAvailabilityDays: number;
} | null;

const mockProviderRepository = {
	findByUserId: mock((): Promise<{ id: string } | null> => Promise.resolve({ id: "provider-1" })),
	findById: mock(
		(): Promise<ProviderRecord> =>
		Promise.resolve({
			id: "provider-1",
			serviceModalities: ["ONLINE", "IN_PERSON"],
			bookingAvailabilityDays: 60,
		}),
	),
};

type PatientProfileActor = { id: string } | null;

const mockPatientProfileRepository = {
	findById: mock((): Promise<PatientProfileActor> => Promise.resolve(null)),
	create: mock(() =>
		Promise.resolve({
			id: "profile-1",
		}),
	),
};

type ProviderProcedure = {
	id: string;
	durationInMinutes: number;
};

const mockProcedureRepository = {
	findByHealthcareProviderId: mock(
		(): Promise<ProviderProcedure[]> =>
		Promise.resolve([
			{
				id: "procedure-1",
				durationInMinutes: 60,
			},
		]),
	),
};

const mockClinicRbac = {
	assertCanCreateAppointmentForProvider: mock(() => Promise.resolve(undefined)),
};

const mockGoogleMeetService = {
	ensureOnlineMeeting: mock((appointment: CreatedAppointment) =>
		Promise.resolve({
			...appointment,
			onlineMeetingUrl: "https://meet.google.com/abc-defg",
		}),
	),
};

const mockRecurringAppointmentsService = {
	assertScheduledAtWithinBookingWindow: mock(() => undefined),
	ensureProviderRecurringAppointmentsUpToDate: mock(() => Promise.resolve(undefined)),
	createSeriesFromAppointment: mock(() =>
		Promise.resolve({
			appointment: {
				id: "appointment-series-1",
				status: "SCHEDULED",
			},
		}),
	),
};

const mockNotifications = {
	sendAppointmentStatusUpdateToCustomer: mock(() => Promise.resolve(undefined)),
	sendNewAppointmentRequestToProvider: mock(() => Promise.resolve(undefined)),
};

mock.module(
	"@/http/repositories/appointments/appointments-repository-implementation",
	() => ({
		prismaAppointmentRepository: mockAppointmentRepository,
	}),
);
mock.module(
	"@/http/repositories/customers/customers-repository-implementation",
	() => ({
		prismaCustomerRepository: mockCustomerRepository,
	}),
);
mock.module(
	"@/http/repositories/healthcare-providers/healthcare-providers-repository-implementation",
	() => ({
		prismaHealthcareProviderRepository: mockProviderRepository,
	}),
);
mock.module(
	"@/http/repositories/patient-profiles/patient-profiles-repository-implementation",
	() => ({
		prismaPatientProfileRepository: mockPatientProfileRepository,
	}),
);
mock.module(
	"@/http/repositories/procedures/procedures-repository-implementation",
	() => ({
		prismaProcedureRepository: mockProcedureRepository,
	}),
);
mock.module("@/http/services/clinic-rbac", () => ({
	clinicRbac: mockClinicRbac,
}));
mock.module("@/http/services/google-meet-service", () => ({
	googleMeetService: mockGoogleMeetService,
}));
mock.module("@/http/services/recurring-appointments", () => ({
	recurringAppointmentsService: mockRecurringAppointmentsService,
}));
mock.module(
	"@/http/useCases/notifications/send-appointment-event-notification-use-case",
	() => ({
		sendAppointmentEventNotificationUseCase: mockNotifications,
	}),
);

const { createAppointmentUseCase } = await import("./index");

describe("createAppointmentUseCase", () => {
	beforeEach(() => {
		mockAppointmentRepository.findByProfessionalAndDateRange.mockReset();
		mockAppointmentRepository.create.mockReset();
		mockAppointmentRepository.existsByPatientProfileAndHealthcareProvider.mockReset();
		mockCustomerRepository.findByUserId.mockReset();
		mockProviderRepository.findByUserId.mockReset();
		mockProviderRepository.findById.mockReset();
		mockPatientProfileRepository.findById.mockReset();
		mockPatientProfileRepository.create.mockReset();
		mockProcedureRepository.findByHealthcareProviderId.mockReset();
		mockClinicRbac.assertCanCreateAppointmentForProvider.mockReset();
		mockGoogleMeetService.ensureOnlineMeeting.mockReset();
		mockRecurringAppointmentsService.assertScheduledAtWithinBookingWindow.mockReset();
		mockRecurringAppointmentsService.ensureProviderRecurringAppointmentsUpToDate.mockReset();
		mockRecurringAppointmentsService.createSeriesFromAppointment.mockReset();
		mockNotifications.sendAppointmentStatusUpdateToCustomer.mockReset();
		mockNotifications.sendNewAppointmentRequestToProvider.mockReset();

		mockAppointmentRepository.findByProfessionalAndDateRange.mockResolvedValue([]);
		mockAppointmentRepository.create.mockImplementation((data: CreateAppointmentData) =>
			Promise.resolve({
				id: "appointment-1",
				totalDurationMinutes: 60,
				...data,
			}),
		);
		mockAppointmentRepository.existsByPatientProfileAndHealthcareProvider.mockResolvedValue(
			false,
		);
		mockCustomerRepository.findByUserId.mockResolvedValue({ id: "customer-1" });
		mockProviderRepository.findByUserId.mockResolvedValue({ id: "provider-1" });
		mockProviderRepository.findById.mockResolvedValue({
			id: "provider-1",
			serviceModalities: ["ONLINE", "IN_PERSON"],
			bookingAvailabilityDays: 60,
		});
		mockPatientProfileRepository.findById.mockResolvedValue(null);
		mockPatientProfileRepository.create.mockResolvedValue({ id: "profile-1" });
		mockProcedureRepository.findByHealthcareProviderId.mockResolvedValue([
			{
				id: "procedure-1",
				durationInMinutes: 60,
			},
		]);
		mockClinicRbac.assertCanCreateAppointmentForProvider.mockResolvedValue(
			undefined,
		);
		mockGoogleMeetService.ensureOnlineMeeting.mockImplementation((appointment: CreatedAppointment) =>
			Promise.resolve({
				...appointment,
				onlineMeetingUrl: "https://meet.google.com/abc-defg",
			}),
		);
		mockRecurringAppointmentsService.assertScheduledAtWithinBookingWindow.mockImplementation(
			() => undefined,
		);
		mockRecurringAppointmentsService.ensureProviderRecurringAppointmentsUpToDate.mockResolvedValue(
			undefined,
		);
		mockRecurringAppointmentsService.createSeriesFromAppointment.mockResolvedValue(
			{
				appointment: {
					id: "appointment-series-1",
					status: "SCHEDULED",
				},
			},
		);
		mockNotifications.sendAppointmentStatusUpdateToCustomer.mockResolvedValue(
			undefined,
		);
		mockNotifications.sendNewAppointmentRequestToProvider.mockResolvedValue(
			undefined,
		);
	});

	test("rejects provider actors without a provider profile", async () => {
		mockProviderRepository.findByUserId.mockResolvedValue(null);

		await expect(
			createAppointmentUseCase.execute(
				makeUser({ id: "provider-user-1", role: "HEALTHCARE_PROVIDER" }),
				{
					scheduledAt: new Date(Date.now() + 60 * 60 * 1000),
					procedureIds: ["procedure-1"],
				} as unknown as Parameters<typeof createAppointmentUseCase.execute>[1],
			),
		).rejects.toThrow("User is not registered as a healthcare provider");
	});

	test("creates scheduled appointment for customer and notifies provider", async () => {
		const scheduledAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
		const result = await createAppointmentUseCase.execute(
			makeUser({ id: "customer-user-1", role: "CUSTOMER" }),
			{
				healthcareProviderId: "provider-1",
				scheduledAt,
				procedureIds: ["procedure-1"],
				serviceModality: "ONLINE",
			} as unknown as Parameters<typeof createAppointmentUseCase.execute>[1],
		);

		expect(mockAppointmentRepository.create).toHaveBeenCalledWith(
			expect.objectContaining({
				customerId: "customer-1",
				healthcareProviderId: "provider-1",
				status: "SCHEDULED",
			}),
		);
		expect(
			mockNotifications.sendNewAppointmentRequestToProvider,
		).toHaveBeenCalledTimes(1);
		expect(result.appointment.status).toBe("SCHEDULED");
	});

	test("creates confirmed appointment for provider and generates meet link", async () => {
		const scheduledAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
		const result = await createAppointmentUseCase.execute(
			makeUser({ id: "provider-user-1", role: "HEALTHCARE_PROVIDER" }),
			{
				scheduledAt,
				procedureIds: ["procedure-1"],
				serviceModality: "ONLINE",
				customer: {
					type: "NEW_PROFILE",
					profile: {
						fullName: "Paciente Teste",
					},
				},
			} as unknown as Parameters<typeof createAppointmentUseCase.execute>[1],
		);

		expect(mockAppointmentRepository.create).toHaveBeenCalledWith(
			expect.objectContaining({
				healthcareProviderId: "provider-1",
				status: "CONFIRMED",
				patientProfileId: "profile-1",
			}),
		);
		expect(mockGoogleMeetService.ensureOnlineMeeting).toHaveBeenCalledTimes(1);
		expect(
			mockNotifications.sendAppointmentStatusUpdateToCustomer,
		).toHaveBeenCalledTimes(1);
		expect(result.appointment.onlineMeetingUrl).toBe(
			"https://meet.google.com/abc-defg",
		);
	});

	test("rejects conflicting appointment times", async () => {
		const scheduledAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
		mockAppointmentRepository.findByProfessionalAndDateRange.mockResolvedValue([
			{
				scheduledAt,
				totalDurationMinutes: 60,
			} as ExistingAppointmentWindow,
		]);

		await expect(
			createAppointmentUseCase.execute(
				makeUser({ id: "customer-user-1", role: "CUSTOMER" }),
				{
					healthcareProviderId: "provider-1",
					scheduledAt,
					procedureIds: ["procedure-1"],
					serviceModality: "ONLINE",
				} as unknown as Parameters<typeof createAppointmentUseCase.execute>[1],
			),
		).rejects.toThrow(
			"This time slot is no longer available for this provider",
		);
	});
});
