import { prisma } from "@/database/prisma";

type ProviderRatingSummary = {
	averageRating: number;
	totalRatings: number;
};

const emptySummary: ProviderRatingSummary = {
	averageRating: 0,
	totalRatings: 0,
};

export async function getProviderRatingSummariesByProviderIds(
	providerIds: string[],
): Promise<Map<string, ProviderRatingSummary>> {
	const uniqueProviderIds = Array.from(new Set(providerIds));
	const summaries = new Map<string, ProviderRatingSummary>(
		uniqueProviderIds.map((providerId) => [providerId, emptySummary]),
	);

	if (uniqueProviderIds.length === 0) {
		return summaries;
	}

	const ratings = await prisma.rating.findMany({
		where: {
			healthcareProviderId: { in: uniqueProviderIds },
		},
		select: {
			healthcareProviderId: true,
			rating: true,
		},
	});

	const totals = new Map<string, { sum: number; count: number }>();

	for (const rating of ratings) {
		const current = totals.get(rating.healthcareProviderId) ?? {
			sum: 0,
			count: 0,
		};
		current.sum += rating.rating;
		current.count += 1;
		totals.set(rating.healthcareProviderId, current);
	}

	for (const [providerId, total] of totals) {
		summaries.set(providerId, {
			averageRating: total.count > 0 ? total.sum / total.count : 0,
			totalRatings: total.count,
		});
	}

	return summaries;
}
