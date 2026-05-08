import type {
	AppointmentStatus,
	appointment,
	user,
	patient_profile,
	procedure,
} from "../../../../prisma/generated/prisma/client";
import type { ServiceModality } from "@/schemas/service-modalities";

export type CreateAppointmentData = {
	customerId?: string | null;
	patientProfileId?: string | null;
	healthcareProviderId: string;
	scheduledAt: Date;
	status?: AppointmentStatus;
	procedureIds: string[];
	serviceModality: ServiceModality;
	notes?: string | null;
};

export type UpdateAppointmentData = {
	scheduledAt?: Date;
	status?: AppointmentStatus;
	notes?: string | null;
	onlineMeetingUrl?: string | null;
	onlineMeetingProvider?: string | null;
	onlineMeetingExternalId?: string | null;
	onlineMeetingCreatedAt?: Date | null;
};

export type AppointmentProcedure = {
	id: string;
	appointmentId: string;
	procedureId: string;
	procedure: procedure;
	createdAt: Date;
};

export type AppointmentWithRelations = appointment & {
	customer: user | null;
	patientProfile: patient_profile | null;
	healthcareProvider: user;
	appointmentProcedures: AppointmentProcedure[];
};

export type DateRangeParams = {
	startDate: Date;
	endDate: Date;
};

export type FindAppointmentsFilters = {
	customerId?: string;
	healthcareProviderId?: string;
	status?: AppointmentStatus;
	search?: string;
	startDate?: Date;
	endDate?: Date;
	limit?: number;
	offset?: number;
};

export type FindAppointmentsResult = {
	appointments: AppointmentWithRelations[];
	total: number;
	limit: number;
	offset: number;
	hasMore: boolean;
};

export type AppointmentRepository = {
	findAll: (filters?: FindAppointmentsFilters) => Promise<FindAppointmentsResult>;
	findById: (id: string) => Promise<AppointmentWithRelations | null>;
	findByUserId: (customerId: string) => Promise<AppointmentWithRelations[]>;
	findByHealthcareProviderId: (
		healthcareProviderId: string,
	) => Promise<AppointmentWithRelations[]>;
	findByDateRange: (
		params: DateRangeParams,
	) => Promise<AppointmentWithRelations[]>;
	findByProfessionalAndDateRange: (
		healthcareProviderId: string,
		params: DateRangeParams,
	) => Promise<AppointmentWithRelations[]>;
	existsByCustomerAndProfessional: (
		customerId: string,
		healthcareProviderId: string,
	) => Promise<boolean>;
	existsConfirmedByCustomerAndProfessional: (
		customerId: string,
		healthcareProviderId: string,
	) => Promise<boolean>;
	existsByPatientProfileAndHealthcareProvider: (
		patientProfileId: string,
		healthcareProviderId: string,
	) => Promise<boolean>;
	create: (data: CreateAppointmentData) => Promise<AppointmentWithRelations>;
	update: (
		id: string,
		data: UpdateAppointmentData,
	) => Promise<AppointmentWithRelations>;
	delete: (id: string) => Promise<void>;
};
