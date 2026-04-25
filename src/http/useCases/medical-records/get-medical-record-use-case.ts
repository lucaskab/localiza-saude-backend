import { prismaAppointmentRepository } from "@/http/repositories/appointments/appointments-repository-implementation";
import { prismaCustomerRepository } from "@/http/repositories/customers/customers-repository-implementation";
import { prismaHealthcareProviderRepository } from "@/http/repositories/healthcare-providers/healthcare-providers-repository-implementation";
import { prismaMedicalRecordRepository } from "@/http/repositories/medical-records/medical-records-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import { UnauthorizedError } from "@/http/routes/_errors/unauthorized-error";
import {
	type customer_medical_record,
	type patient_profile,
	type user,
} from "../../../../prisma/generated/prisma/client";

type MedicalRecordFields = Pick<
	customer_medical_record,
	| "bloodType"
	| "medications"
	| "chronicPain"
	| "preExistingConditions"
	| "allergies"
	| "surgeries"
	| "familyHistory"
	| "lifestyleNotes"
	| "emergencyContactName"
	| "emergencyContactPhone"
>;

type PatientProfileMedicalRecord = MedicalRecordFields & {
	id: string;
	customerId: null;
	patientProfileId: string;
	createdAt: Date;
	updatedAt: Date;
};

type AppointmentMedicalRecord =
	| customer_medical_record
	| PatientProfileMedicalRecord;

function hasMedicalRecordContent(medicalRecord: MedicalRecordFields | null) {
	if (!medicalRecord) {
		return false;
	}

	return [
		medicalRecord.bloodType,
		medicalRecord.medications,
		medicalRecord.chronicPain,
		medicalRecord.preExistingConditions,
		medicalRecord.allergies,
		medicalRecord.surgeries,
		medicalRecord.familyHistory,
		medicalRecord.lifestyleNotes,
		medicalRecord.emergencyContactName,
		medicalRecord.emergencyContactPhone,
	].some((value) => Boolean(value?.trim()));
}

function patientProfileToMedicalRecord(
	patientProfile: patient_profile,
): PatientProfileMedicalRecord {
	return {
		id: patientProfile.id,
		customerId: null,
		patientProfileId: patientProfile.id,
		bloodType: patientProfile.bloodType,
		medications: patientProfile.medications,
		chronicPain: patientProfile.chronicPain,
		preExistingConditions: patientProfile.preExistingConditions,
		allergies: patientProfile.allergies,
		surgeries: patientProfile.surgeries,
		familyHistory: patientProfile.familyHistory,
		lifestyleNotes: patientProfile.lifestyleNotes,
		emergencyContactName: patientProfile.emergencyContactName,
		emergencyContactPhone: patientProfile.emergencyContactPhone,
		createdAt: patientProfile.createdAt,
		updatedAt: patientProfile.updatedAt,
	};
}

export const getMyMedicalRecordUseCase = {
	async execute(
		userId: string,
	): Promise<{ medicalRecord: customer_medical_record | null }> {
		const customer = await prismaCustomerRepository.findByUserId(userId);

		if (!customer) {
			throw new BadRequestError("User is not registered as a customer");
		}

		const medicalRecord = await prismaMedicalRecordRepository.findByCustomerId(
			customer.id,
		);

		return { medicalRecord };
	},
};

export const getCustomerMedicalRecordUseCase = {
	async execute(
		customerId: string,
		currentUser: user,
	): Promise<{ medicalRecord: customer_medical_record | null }> {
		const customer = await prismaCustomerRepository.findById(customerId);

		if (!customer) {
			throw new BadRequestError("Customer not found");
		}

		if (customer.userId === currentUser.id) {
			const medicalRecord = await prismaMedicalRecordRepository.findByCustomerId(
				customer.id,
			);

			return { medicalRecord };
		}

		const provider = await prismaHealthcareProviderRepository.findByUserId(
			currentUser.id,
		);

		if (!provider) {
			throw new UnauthorizedError("You cannot access this medical record");
		}

		const relatedAppointment =
			await prismaAppointmentRepository.existsConfirmedByCustomerAndProvider(
				customer.id,
				provider.id,
			);

		if (!relatedAppointment) {
			throw new UnauthorizedError("You cannot access this medical record");
		}

		const medicalRecord = await prismaMedicalRecordRepository.findByCustomerId(
			customer.id,
		);

		return {
			medicalRecord: hasMedicalRecordContent(medicalRecord)
				? medicalRecord
				: null,
		};
	},
};

export const getAppointmentMedicalRecordUseCase = {
	async execute(
		appointmentId: string,
		currentUser: user,
	): Promise<{ medicalRecord: AppointmentMedicalRecord | null }> {
		const provider = await prismaHealthcareProviderRepository.findByUserId(
			currentUser.id,
		);

		if (!provider) {
			throw new UnauthorizedError("You cannot access this medical record");
		}

		const appointment = await prismaAppointmentRepository.findById(appointmentId);

		if (!appointment) {
			throw new BadRequestError("Appointment not found");
		}

		if (appointment.healthcareProviderId !== provider.id) {
			throw new UnauthorizedError("You cannot access this medical record");
		}

		if (appointment.status !== "CONFIRMED") {
			return { medicalRecord: null };
		}

		if (appointment.patientProfile) {
			const medicalRecord = patientProfileToMedicalRecord(
				appointment.patientProfile,
			);

			return {
				medicalRecord: hasMedicalRecordContent(medicalRecord)
					? medicalRecord
					: null,
			};
		}

		if (!appointment.customerId) {
			return { medicalRecord: null };
		}

		const medicalRecord = await prismaMedicalRecordRepository.findByCustomerId(
			appointment.customerId,
		);

		return {
			medicalRecord: hasMedicalRecordContent(medicalRecord)
				? medicalRecord
				: null,
		};
	},
};
