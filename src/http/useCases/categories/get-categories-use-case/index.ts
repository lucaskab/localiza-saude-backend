import { categoryPresenter } from "@/http/presenters/category-presenter";
import { prismaCategoryRepository } from "@/http/repositories/categories/categories-repository-implementation";
import { attachPrimaryAddressesToOwners } from "@/http/useCases/addresses/attach-primary-addresses";
import { getNextAvailableSlotsByProviderIds } from "@/http/useCases/healthcare-providers/get-next-available-slots";
import { getProviderRatingSummariesByProviderIds } from "@/http/useCases/ratings/get-provider-rating-summaries";

export const getCategoriesUseCase = {
	async execute() {
		const categories = await prismaCategoryRepository.findAll();
		const providers = categories.flatMap((category) =>
			category.healthcareProviderCategories.map((hpc) => hpc.healthcareProvider),
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
		const categoriesWithAddresses = categories.map((category) => ({
			...category,
			healthcareProviderCategories: category.healthcareProviderCategories.map(
				(hpc) => ({
					...hpc,
					healthcareProvider:
						providerById.get(hpc.healthcareProvider.id) ?? hpc.healthcareProvider,
				}),
			),
		}));

		return {
			categories: categoryPresenter.toHTTPMany(
				categoriesWithAddresses,
				nextAvailableByProviderId,
				ratingSummariesByProviderId,
			),
		};
	},
};
