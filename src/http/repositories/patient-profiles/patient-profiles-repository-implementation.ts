import { prisma } from "@/database/prisma";
import type {
	PatientProfileData,
	PatientProfileRepository,
} from "./patient-profiles-repository-contract";

export const prismaPatientProfileRepository: PatientProfileRepository = {
	async findById(id: string) {
		const patientProfile = await prisma.patient_profile.findUnique({
			where: { id },
		});

		return patientProfile;
	},

	async findByCustomerOwnerId(customerId: string) {
		const patientProfiles = await prisma.patient_profile.findMany({
			where: { customerOwnerId: customerId },
			orderBy: { updatedAt: "desc" },
		});

		return patientProfiles;
	},

	async findByHealthcareProviderId(healthcareProviderId: string) {
		const patientProfiles = await prisma.patient_profile.findMany({
			where: {
				OR: [
					{ createdByHealthcareProviderId: healthcareProviderId },
					{
						appointments: {
							some: {
								healthcareProviderId,
							},
						},
					},
				],
			},
			orderBy: { updatedAt: "desc" },
		});

		return patientProfiles;
	},

	async create(data: PatientProfileData) {
		const patientProfile = await prisma.patient_profile.create({
			data: {
				fullName: data.fullName,
				dateOfBirth: data.dateOfBirth,
				cpf: data.cpf,
				phone: data.phone,
				email: data.email,
				address: data.address,
				gender: data.gender,
				relationshipToCustomer: data.relationshipToCustomer,
				notes: data.notes,
				customerOwnerId: data.customerOwnerId,
				createdByHealthcareProviderId: data.createdByHealthcareProviderId,
				bloodType: data.bloodType,
				medications: data.medications,
				chronicPain: data.chronicPain,
				preExistingConditions: data.preExistingConditions,
				allergies: data.allergies,
				surgeries: data.surgeries,
				familyHistory: data.familyHistory,
				lifestyleNotes: data.lifestyleNotes,
				emergencyContactName: data.emergencyContactName,
				emergencyContactPhone: data.emergencyContactPhone,
			},
		});

		return patientProfile;
	},
};
