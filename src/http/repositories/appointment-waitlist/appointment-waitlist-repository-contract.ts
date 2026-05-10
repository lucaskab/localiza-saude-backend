import type {
	appointment,
	appointment_waitlist_entry,
	appointment_waitlist_entry_procedure,
	procedure,
	user,
} from "../../../../prisma/generated/prisma/client";

export type AppointmentWaitlistEntryProcedure =
	appointment_waitlist_entry_procedure & {
		procedure: procedure;
	};

export type AppointmentWaitlistEntryWithRelations =
	appointment_waitlist_entry & {
		customer: user;
		healthcareProvider: user;
		procedures: AppointmentWaitlistEntryProcedure[];
	};

export type CreateAppointmentWaitlistEntryData = {
	customerId: string;
	healthcareProviderId: string;
	desiredScheduledAt: Date;
	procedureIds: string[];
};

export type AppointmentWaitlistRepository = {
	findById: (id: string) => Promise<AppointmentWaitlistEntryWithRelations | null>;
	findBySlotAndCustomer: (
		healthcareProviderId: string,
		customerId: string,
		desiredScheduledAt: Date,
	) => Promise<AppointmentWaitlistEntryWithRelations | null>;
	upsertActive: (
		data: CreateAppointmentWaitlistEntryData,
	) => Promise<AppointmentWaitlistEntryWithRelations>;
	cancel: (id: string) => Promise<AppointmentWaitlistEntryWithRelations>;
	findMatchingForCancelledAppointment: (
		appointment: appointment,
	) => Promise<AppointmentWaitlistEntryWithRelations[]>;
	markNotified: (id: string) => Promise<void>;
};
