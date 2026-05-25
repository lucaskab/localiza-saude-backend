import { categoryPresenter } from "@/http/presenters/category-presenter";
import { prismaCategoryRepository } from "@/http/repositories/categories/categories-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import { attachPrimaryAddressesToOwners } from "@/http/useCases/addresses/attach-primary-addresses";
import { getNextAvailableSlotsByProviderIds } from "@/http/useCases/healthcare-providers/get-next-available-slots";
import { getProviderRatingSummariesByProviderIds } from "@/http/useCases/ratings/get-provider-rating-summaries";

export const getCategoryByIdUseCase = {
	async execute(id: string) {
		const category = await prismaCategoryRepository.findById(id);

		if (!category) {
			throw new BadRequestError("Category not found");
		}
		const providers = category.healthcareProviderCategories.map(
			(hpc) => hpc.healthcareProvider,
		);
		const providerIds = providers.map((provider) => provider.id);
		const [nextAvailableByProviderId, ratingSummariesByProviderId, providersWithAddress] =
			await Promise.all([
				getNextAvailableSlotsByProviderIds(providerIds),
				getProviderRatingSummariesByProviderIds(providerIds),
				attachPrimaryAddressesToOwners("USER", providers, "CLINIC"),
			]);
		const providerById = new Map(
			providersWithAddress.map((provider) => [provider.id, provider]),
		);

		return {
			category: categoryPresenter.toHTTP(
				{
					...category,
					healthcareProviderCategories: category.healthcareProviderCategories.map(
						(hpc) => ({
							...hpc,
							healthcareProvider:
								providerById.get(hpc.healthcareProvider.id) ??
								hpc.healthcareProvider,
						}),
					),
				},
				nextAvailableByProviderId,
				ratingSummariesByProviderId,
			),
		};
	},
};
