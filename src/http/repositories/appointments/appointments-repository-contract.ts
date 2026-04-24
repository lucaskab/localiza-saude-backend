import type {
	AppointmentStatus,
	appointment,
	customer,
	healthcare_provider,
	procedure,
	user,
} from "../../../../prisma/generated/prisma/client";

export type CreateAppointmentData = {
	customerId: string;
	healthcareProviderId: string;
	scheduledAt: Date;
	procedureIds: string[];
	notes?: string | null;
};

export type UpdateAppointmentData = {
	scheduledAt?: Date;
	status?: AppointmentStatus;
	notes?: string | null;
};

export type AppointmentProcedure = {
	id: string;
	appointmentId: string;
	procedureId: string;
	procedure: procedure;
	createdAt: Date;
};

export type AppointmentWithRelations = appointment & {
	customer: customer & {
		user: user;
	};
	healthcareProvider: healthcare_provider & {
		user: user;
	};
	appointmentProcedures: AppointmentProcedure[];
};

export type DateRangeParams = {
	startDate: Date;
	endDate: Date;
};

export type FindAppointmentsFilters = {
	healthcareProviderId?: string;
	startDate?: Date;
	endDate?: Date;
};

export type AppointmentRepository = {
	findAll: (
		filters?: FindAppointmentsFilters,
	) => Promise<AppointmentWithRelations[]>;
	findById: (id: string) => Promise<AppointmentWithRelations | null>;
	findByCustomerId: (customerId: string) => Promise<AppointmentWithRelations[]>;
	findByHealthcareProviderId: (
		healthcareProviderId: string,
	) => Promise<AppointmentWithRelations[]>;
	findByDateRange: (
		params: DateRangeParams,
	) => Promise<AppointmentWithRelations[]>;
	findByProviderAndDateRange: (
		healthcareProviderId: string,
		params: DateRangeParams,
	) => Promise<AppointmentWithRelations[]>;
	existsByCustomerAndProvider: (
		customerId: string,
		healthcareProviderId: string,
	) => Promise<boolean>;
	create: (data: CreateAppointmentData) => Promise<AppointmentWithRelations>;
	update: (
		id: string,
		data: UpdateAppointmentData,
	) => Promise<AppointmentWithRelations>;
	delete: (id: string) => Promise<void>;
};
