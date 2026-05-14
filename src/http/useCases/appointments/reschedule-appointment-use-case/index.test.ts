import { beforeEach, describe, expect, mock, test } from "bun:test";
import type {
	AppointmentWithRelations,
	UpdateAppointmentData,
} from "@/http/repositories/appointments/appointments-repository-contract";
import { makeUser } from "@/http/tests/factories";

type ScheduleSelection = {
	startTime: string;
	endTime: string;
};

type ProviderBookingWindow = {
	bookingAvailabilityDays: number | null;
};

type RescheduleRequestSelection = {
	id: string;
	appointmentId: string;
	status: "PENDING" | "DECLINED" | "ACCEPTED" | "CANCELLED";
	proposedScheduledAt: Date;
};

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
	healthcareProvider: makeUser({
		id: "provider-1",
		role: "HEALTHCARE_PROVIDER",
	}),
	cancelledByUser: null,
	recurringSeries: null,
	recurringRule: null,
	appointmentProcedures: [],
	rescheduleRequests: [],
	status: "SCHEDULED",
	scheduledAt: new Date("2026-08-20T10:00:00.000Z"),
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
	...overrides,
});

const appointmentBase = makeAppointment();

const mockPrisma = {
	healthcare_provider_schedule: {
		findFirst: mock((): Promise<ScheduleSelection | null> =>
			Promise.resolve({
				startTime: "09:00",
				endTime: "18:00",
			}),
		),
	},
	user: {
		findUnique: mock((): Promise<ProviderBookingWindow | null> =>
			Promise.resolve({
				bookingAvailabilityDays: 60,
			}),
		),
	},
	appointment_reschedule_request: {
		updateMany: mock(() => Promise.resolve({ count: 1 })),
		create: mock(() => Promise.resolve(undefined)),
		findUnique: mock((): Promise<RescheduleRequestSelection | null> =>
			Promise.resolve({
				id: "request-1",
				appointmentId: "appointment-1",
				status: "PENDING",
				proposedScheduledAt: new Date("2026-08-21T11:00:00.000Z"),
			}),
		),
		update: mock(() => Promise.resolve(undefined)),
	},
};

const mockAppointmentRepository = {
	findById: mock((_: string): Promise<AppointmentWithRelations | null> =>
		Promise.resolve(appointmentBase),
	),
	findByProfessionalAndDateRange: mock(
		(): Promise<AppointmentWithRelations[]> => Promise.resolve([]),
	),
	update: mock(
		(_id: string, data: UpdateAppointmentData): Promise<AppointmentWithRelations> =>
			Promise.resolve({
				...appointmentBase,
				...data,
			}),
	),
};

const mockClinicRbac = {
	canManageProvider: mock(() => Promise.resolve(false)),
};

const mockGoogleMeetService = {
	ensureOnlineMeeting: mock(
		(appointment: AppointmentWithRelations): Promise<AppointmentWithRelations> =>
			Promise.resolve(appointment),
	),
};

const mockRecurringAppointmentsService = {
	assertScheduledAtWithinBookingWindow: mock(() => new Date("2026-10-01T23:59:59.999Z")),
	ensureProviderRecurringAppointmentsUpToDate: mock(() => Promise.resolve(undefined)),
};

mock.module("@/database/prisma", () => ({
	prisma: mockPrisma,
}));

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

mock.module("@/http/services/recurring-appointments", () => ({
	recurringAppointmentsService: mockRecurringAppointmentsService,
}));

const { rescheduleAppointmentUseCase } = await import("./index");

describe("rescheduleAppointmentUseCase", () => {
	beforeEach(() => {
		mockPrisma.healthcare_provider_schedule.findFirst.mockReset();
		mockPrisma.user.findUnique.mockReset();
		mockPrisma.appointment_reschedule_request.updateMany.mockReset();
		mockPrisma.appointment_reschedule_request.create.mockReset();
		mockPrisma.appointment_reschedule_request.findUnique.mockReset();
		mockPrisma.appointment_reschedule_request.update.mockReset();
		mockAppointmentRepository.findById.mockReset();
		mockAppointmentRepository.findByProfessionalAndDateRange.mockReset();
		mockAppointmentRepository.update.mockReset();
		mockClinicRbac.canManageProvider.mockReset();
		mockGoogleMeetService.ensureOnlineMeeting.mockReset();
		mockRecurringAppointmentsService.assertScheduledAtWithinBookingWindow.mockReset();
		mockRecurringAppointmentsService.ensureProviderRecurringAppointmentsUpToDate.mockReset();

		mockPrisma.healthcare_provider_schedule.findFirst.mockResolvedValue({
			startTime: "09:00",
			endTime: "18:00",
		});
		mockPrisma.user.findUnique.mockResolvedValue({
			bookingAvailabilityDays: 60,
		});
		mockPrisma.appointment_reschedule_request.updateMany.mockResolvedValue(
			{ count: 1 },
		);
		mockPrisma.appointment_reschedule_request.create.mockResolvedValue(undefined);
		mockPrisma.appointment_reschedule_request.findUnique.mockResolvedValue({
			id: "request-1",
			appointmentId: "appointment-1",
			status: "PENDING",
			proposedScheduledAt: new Date("2026-08-21T11:00:00.000Z"),
		});
		mockPrisma.appointment_reschedule_request.update.mockResolvedValue(undefined);
		mockAppointmentRepository.findById.mockResolvedValue({ ...appointmentBase });
		mockAppointmentRepository.findByProfessionalAndDateRange.mockResolvedValue([]);
		mockAppointmentRepository.update.mockImplementation(
			async (_id: string, data: UpdateAppointmentData) => ({
				...appointmentBase,
				...data,
			}),
		);
		mockClinicRbac.canManageProvider.mockResolvedValue(false);
		mockGoogleMeetService.ensureOnlineMeeting.mockImplementation(
			(appointment: AppointmentWithRelations): Promise<AppointmentWithRelations> =>
				Promise.resolve(appointment),
		);
		mockRecurringAppointmentsService.assertScheduledAtWithinBookingWindow.mockReturnValue(
			new Date("2026-10-01T23:59:59.999Z"),
		);
		mockRecurringAppointmentsService.ensureProviderRecurringAppointmentsUpToDate.mockResolvedValue(
			undefined,
		);
	});

	test("applies reschedule immediately when requested by customer", async () => {
		const scheduledAt = new Date("2026-08-21T11:00:00.000Z");

		const result = await rescheduleAppointmentUseCase.request(
			"appointment-1",
			makeUser({ id: "customer-1", role: "CUSTOMER" }),
			{
				scheduledAt,
			},
		);

		expect(mockAppointmentRepository.update).toHaveBeenCalledWith(
			"appointment-1",
			expect.objectContaining({
				scheduledAt,
				onlineMeetingUrl: null,
			}),
		);
		expect(result.appointment.scheduledAt).toEqual(scheduledAt);
	});

	test("creates a pending reschedule request when provider asks customer approval", async () => {
		await rescheduleAppointmentUseCase.request(
			"appointment-1",
			makeUser({ id: "provider-1", role: "HEALTHCARE_PROVIDER" }),
			{
				scheduledAt: new Date("2026-08-21T11:00:00.000Z"),
				reason: "New office schedule",
			},
		);

		expect(mockPrisma.appointment_reschedule_request.updateMany).toHaveBeenCalled();
		expect(mockPrisma.appointment_reschedule_request.create).toHaveBeenCalledWith({
			data: expect.objectContaining({
				appointmentId: "appointment-1",
				requestedByUserId: "provider-1",
				reason: "New office schedule",
			}),
		});
	});

	test("declines a pending reschedule request when customer rejects it", async () => {
		await rescheduleAppointmentUseCase.respond(
			"appointment-1",
			"request-1",
			makeUser({ id: "customer-1", role: "CUSTOMER" }),
			{
				action: "DECLINE",
			},
		);

		expect(mockPrisma.appointment_reschedule_request.update).toHaveBeenCalledWith({
			where: { id: "request-1" },
			data: expect.objectContaining({
				status: "DECLINED",
			}),
		});
	});
});
