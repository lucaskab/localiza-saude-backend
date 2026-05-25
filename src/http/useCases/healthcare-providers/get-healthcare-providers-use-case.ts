import type { HealthcareProviderWithRelations } from "@/http/repositories/healthcare-providers/healthcare-providers-repository-contract";
import { prismaHealthcareProviderRepository } from "@/http/repositories/healthcare-providers/healthcare-providers-repository-implementation";
import type { GetHealthcareProvidersQuerySchema } from "@/schemas/routes/healthcare-providers/get-healthcare-providers";
import { getProviderRatingSummariesByProviderIds } from "@/http/useCases/ratings/get-provider-rating-summaries";
import { getProviderMarketplaceMetricsByProviderIds } from "./get-provider-marketplace-metrics";
import { getNextAvailableSlotsByProviderIds } from "./get-next-available-slots";
import { signClinicPhotoUrls } from "./sign-clinic-photo-urls";
import {
	type PublicHealthcareProvider,
	toPublicHealthcareProvider,
} from "./to-public-healthcare-provider";

type EnrichedHealthcareProvider = HealthcareProviderWithRelations & {
	nextAvailableAt: Date | null;
	startingPriceCents: number | null;
	averageRating: number;
	totalRatings: number;
	completedAppointments: number;
	confirmationRate: number;
	distanceInKm?: number | null;
};

type HealthcareProviderWithNextAvailability =
	PublicHealthcareProvider<EnrichedHealthcareProvider>;

function getStartingPriceCents(provider: HealthcareProviderWithRelations) {
	if (provider.procedures.length === 0) {
		return null;
	}

	return Math.min(
		...provider.procedures.map((procedure) => procedure.priceInCents),
	);
}

function applyComputedFilters(
	providers: EnrichedHealthcareProvider[],
	filters: Partial<GetHealthcareProvidersQuerySchema>,
) {
	return providers.filter((provider) => {
		if (filters.available && !provider.nextAvailableAt) {
			return false;
		}

		if (
			typeof filters.minRating === "number" &&
			provider.averageRating < filters.minRating
		) {
			return false;
		}

		return true;
	});
}

export const getHealthcareProvidersUseCase = {
	async execute(
		filters: Partial<GetHealthcareProvidersQuerySchema> = {},
	): Promise<{
		healthcareProviders: HealthcareProviderWithNextAvailability[];
		total: number;
		limit: number;
		offset: number;
		hasMore: boolean;
	}> {
		const healthcareProviders =
			await prismaHealthcareProviderRepository.findAll({
				search: filters.search,
				specialty: filters.specialty,
				serviceModality: filters.serviceModality,
				language: filters.language,
				insurance: filters.insurance,
				city: filters.city,
				neighborhood: filters.neighborhood,
				latitude: filters.latitude,
				longitude: filters.longitude,
				radiusInKm: filters.radiusInKm,
				maxPriceCents: filters.maxPriceCents,
			});
		const providerIds = healthcareProviders.map((provider) => provider.id);
		const [nextAvailableByProviderId, ratingSummariesByProviderId] =
			await Promise.all([
				getNextAvailableSlotsByProviderIds(providerIds),
				getProviderRatingSummariesByProviderIds(providerIds),
			]);
		const marketplaceMetricsByProviderId =
			await getProviderMarketplaceMetricsByProviderIds(providerIds);

		const enrichedProviders: EnrichedHealthcareProvider[] =
			healthcareProviders.map((provider) => {
			const ratingSummary = ratingSummariesByProviderId.get(provider.id);
			const marketplaceMetrics = marketplaceMetricsByProviderId.get(
				provider.id,
			);

				return {
					...provider,
					nextAvailableAt: nextAvailableByProviderId.get(provider.id) ?? null,
					startingPriceCents: getStartingPriceCents(provider),
					averageRating: ratingSummary?.averageRating ?? 0,
					totalRatings: ratingSummary?.totalRatings ?? 0,
					completedAppointments:
						marketplaceMetrics?.completedAppointments ?? 0,
					confirmationRate: marketplaceMetrics?.confirmationRate ?? 0,
				};
			});

		const filteredProviders = applyComputedFilters(enrichedProviders, filters);
		const limit = filters.limit ?? 20;
		const offset = filters.offset ?? 0;
		const paginatedProviders = filteredProviders
			.slice(offset, offset + limit)
			.map((provider) =>
				toPublicHealthcareProvider(signClinicPhotoUrls(provider)),
			);

		return {
			healthcareProviders: paginatedProviders,
			total: filteredProviders.length,
			limit,
			offset,
			hasMore: offset + paginatedProviders.length < filteredProviders.length,
		};
	},
};
