import { prisma } from "@/database/prisma";

type ProviderMarketplaceMetrics = {
	completedAppointments: number;
	confirmationRate: number;
	isSuperProfessional: boolean;
};

type ProviderQualityInput = {
	averageRating: number;
	totalRatings: number;
};

const emptyMetrics: ProviderMarketplaceMetrics = {
	completedAppointments: 0,
	confirmationRate: 0,
	isSuperProfessional: false,
};

const confirmedStatuses = new Set(["CONFIRMED", "IN_PROGRESS", "COMPLETED"]);

export async function getProviderMarketplaceMetricsByProviderIds(
	providerIds: string[],
	qualityByProviderId?: Map<string, ProviderQualityInput>,
): Promise<Map<string, ProviderMarketplaceMetrics>> {
	const uniqueProviderIds = Array.from(new Set(providerIds));
	const metrics = new Map<string, ProviderMarketplaceMetrics>(
		uniqueProviderIds.map((providerId) => [providerId, emptyMetrics]),
	);

	if (uniqueProviderIds.length === 0) {
		return metrics;
	}

	const appointments = await prisma.appointment.findMany({
		where: {
			healthcareProviderId: { in: uniqueProviderIds },
		},
		select: {
			healthcareProviderId: true,
			status: true,
		},
	});

	const totals = new Map<
		string,
		{ total: number; confirmed: number; completed: number }
	>();

	for (const appointment of appointments) {
		const current = totals.get(appointment.healthcareProviderId) ?? {
			total: 0,
			confirmed: 0,
			completed: 0,
		};

		current.total += 1;

		if (confirmedStatuses.has(appointment.status)) {
			current.confirmed += 1;
		}

		if (appointment.status === "COMPLETED") {
			current.completed += 1;
		}

		totals.set(appointment.healthcareProviderId, current);
	}

	for (const providerId of uniqueProviderIds) {
		const total = totals.get(providerId);
		const quality = qualityByProviderId?.get(providerId);
		const confirmationRate = total?.total
			? total.confirmed / total.total
			: 0;
		const completedAppointments = total?.completed ?? 0;

		metrics.set(providerId, {
			completedAppointments,
			confirmationRate,
			isSuperProfessional:
				completedAppointments >= 20 &&
				confirmationRate >= 0.85 &&
				(quality?.averageRating ?? 0) >= 4.8 &&
				(quality?.totalRatings ?? 0) >= 10,
		});
	}

	return metrics;
}
