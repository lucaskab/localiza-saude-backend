import { prismaCustomerRepository } from "@/http/repositories/customers/customers-repository-implementation";
import { prismaHealthcareProviderRepository } from "@/http/repositories/healthcare-providers/healthcare-providers-repository-implementation";
import type {
	customer,
	healthcare_provider,
	user,
} from "../../../../prisma/generated/prisma/client";

export type PatientProfileActor = {
	customer: customer | null;
	healthcareProvider: healthcare_provider | null;
};

export async function getPatientProfileActor(
	currentUser: user,
): Promise<PatientProfileActor> {
	const [customer, healthcareProvider] = await Promise.all([
		prismaCustomerRepository.findByUserId(currentUser.id),
		prismaHealthcareProviderRepository.findByUserId(currentUser.id),
	]);

	return { customer, healthcareProvider };
}
