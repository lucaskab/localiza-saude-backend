import { prismaClinicRepository } from "@/http/repositories/clinics/clinics-repository-implementation";
import { attachPrimaryAddressesToOwners } from "@/http/useCases/addresses/attach-primary-addresses";

export const getClinicsUseCase = {
	async execute() {
		const clinics = await prismaClinicRepository.findAll();

		return {
			clinics: await attachPrimaryAddressesToOwners("CLINIC", clinics, "CLINIC"),
		};
	},
};
