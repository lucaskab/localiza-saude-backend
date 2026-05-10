import type {
	appointment,
	category,
	clinic,
	PrismaClient,
	patient_profile,
	procedure,
	user,
} from "../generated/prisma/client";

export type SeedClient = PrismaClient;

export type SeedUsers = {
	customers: {
		lucas: user;
		juliana: user;
	};
	admin: user;
	providers: Record<string, user>;
	staff: Record<string, user>;
};

export type SeedCategories = Record<string, category>;

export type SeedClinics = Record<string, clinic>;

export type SeedProcedures = Record<string, procedure>;

export type SeedPatientProfiles = Record<string, patient_profile>;

export type SeedAppointments = Record<string, appointment>;

export type SeedState = {
	users: SeedUsers;
	categories: SeedCategories;
	clinics: SeedClinics;
	procedures: SeedProcedures;
	patientProfiles: SeedPatientProfiles;
	appointments: SeedAppointments;
};
