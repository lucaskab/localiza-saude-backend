import { prismaAddressRepository } from "@/http/repositories/addresses/addresses-repository-implementation";
import { prismaCustomerRepository } from "@/http/repositories/customers/customers-repository-implementation";
import { prismaHealthcareProviderRepository } from "@/http/repositories/healthcare-providers/healthcare-providers-repository-implementation";
import { addressPresenter } from "@/http/presenters/address-presenter";
import { signClinicPhotoUrls } from "@/http/useCases/healthcare-providers/sign-clinic-photo-urls";
import { findUserHealthInsurancePlans } from "@/http/services/health-insurance-plans";
import { signUserImage } from "@/http/useCases/users/sign-user-image-url";
import type { user } from "../../../../prisma/generated/prisma/client";

export const getAuthMeUseCase = {
	async execute(currentUser: user) {
		const user = signUserImage(currentUser);

		if (!user.onboardingCompleted) {
			return {
				user,
				customer: null,
				healthcareProvider: null,
			};
		}

		if (user.role === "CUSTOMER") {
			const customer = await prismaCustomerRepository.findByUserId(user.id);
			const [primaryAddress, healthInsurancePlans] = await Promise.all([
				prismaAddressRepository.findPrimaryByOwner("USER", user.id),
				findUserHealthInsurancePlans(user.id),
			]);

			return {
				user,
				customer: customer
					? {
							...signUserImage(customer),
							primaryAddress: primaryAddress
								? addressPresenter.toHTTP(primaryAddress)
								: null,
							healthInsurancePlans,
						}
					: null,
				healthcareProvider: null,
			};
		}

		if (user.role === "HEALTHCARE_PROVIDER") {
			const healthcareProvider =
				await prismaHealthcareProviderRepository.findByUserId(user.id);

			return {
				user,
				customer: null,
				healthcareProvider: healthcareProvider
					? signClinicPhotoUrls(healthcareProvider)
					: null,
			};
		}

		return {
			user,
			customer: null,
			healthcareProvider: null,
		};
	},
};
