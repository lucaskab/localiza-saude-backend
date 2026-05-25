import type { HealthcareProviderWithRelations } from "@/http/repositories/healthcare-providers/healthcare-providers-repository-contract";
import { prismaHealthcareProviderRepository } from "@/http/repositories/healthcare-providers/healthcare-providers-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import { getProviderMarketplaceMetricsByProviderIds } from "@/http/useCases/healthcare-providers/get-provider-marketplace-metrics";
import { signClinicPhotoUrls } from "@/http/useCases/healthcare-providers/sign-clinic-photo-urls";
import { getProviderRatingSummariesByProviderIds } from "@/http/useCases/ratings/get-provider-rating-summaries";
import {
	type PublicHealthcareProvider,
	toPublicHealthcareProvider,
} from "./to-public-healthcare-provider";

type HealthcareProviderWithRatingSummary = HealthcareProviderWithRelations & {
	startingPriceCents: number | null;
	averageRating: number;
	totalRatings: number;
	completedAppointments: number;
	confirmationRate: number;
};

type PublicHealthcareProviderWithRatingSummary = PublicHealthcareProvider<
	HealthcareProviderWithRatingSummary
>;

function getStartingPriceCents(provider: HealthcareProviderWithRelations) {
	if (provider.procedures.length === 0) {
		return null;
	}

	return Math.min(
		...provider.procedures.map((procedure) => procedure.priceInCents),
	);
}

export const getHealthcareProviderByIdUseCase = {
	async execute(
		id: string,
	): Promise<{ healthcareProvider: PublicHealthcareProviderWithRatingSummary }> {
		const healthcareProvider =
			await prismaHealthcareProviderRepository.findById(id);

		if (!healthcareProvider) {
			throw new BadRequestError("Healthcare provider not found");
		}

		if (healthcareProvider.verificationStatus !== "VERIFIED") {
			throw new BadRequestError("Healthcare provider not found");
		}
		const ratingSummaries = await getProviderRatingSummariesByProviderIds([
			healthcareProvider.id,
		]);
		const ratingSummary = ratingSummaries.get(healthcareProvider.id);
		const marketplaceMetrics = (
			await getProviderMarketplaceMetricsByProviderIds([healthcareProvider.id])
		).get(healthcareProvider.id);

		return {
			healthcareProvider: toPublicHealthcareProvider(
				signClinicPhotoUrls({
					...healthcareProvider,
					startingPriceCents: getStartingPriceCents(healthcareProvider),
					averageRating: ratingSummary?.averageRating ?? 0,
					totalRatings: ratingSummary?.totalRatings ?? 0,
					completedAppointments:
						marketplaceMetrics?.completedAppointments ?? 0,
					confirmationRate: marketplaceMetrics?.confirmationRate ?? 0,
				}),
			),
		};
	},
};
