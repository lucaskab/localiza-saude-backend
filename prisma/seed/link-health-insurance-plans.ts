import { PROVIDERS } from "./constants";
import type { SeedHealthInsurancePlans } from "./health-insurance-plans";
import type { SeedClient, SeedUsers } from "./types";

async function linkProviderPlans(
	prisma: SeedClient,
	healthcareProviderId: string,
	plans: SeedHealthInsurancePlans,
	planNames: string[],
) {
	await prisma.healthcare_provider_health_insurance_plan.deleteMany({
		where: { healthcareProviderId },
	});

	const links = planNames
		.map((name) => plans[name as keyof SeedHealthInsurancePlans])
		.filter(Boolean)
		.map((plan) => ({
			healthcareProviderId,
			healthInsurancePlanId: plan.id,
		}));

	if (links.length === 0) {
		return;
	}

	await prisma.healthcare_provider_health_insurance_plan.createMany({
		data: links,
	});
}

async function linkUserPlans(
	prisma: SeedClient,
	userId: string,
	plans: SeedHealthInsurancePlans,
	planNames: string[],
) {
	await prisma.user_health_insurance_plan.deleteMany({
		where: { userId },
	});

	const links = planNames
		.map((name) => plans[name as keyof SeedHealthInsurancePlans])
		.filter(Boolean)
		.map((plan) => ({
			userId,
			healthInsurancePlanId: plan.id,
		}));

	if (links.length === 0) {
		return;
	}

	await prisma.user_health_insurance_plan.createMany({
		data: links,
	});
}

export async function seedHealthInsurancePlanLinks(
	prisma: SeedClient,
	plans: SeedHealthInsurancePlans,
	users: SeedUsers,
) {
	console.log("🔗 Linking health insurance plans...");

	await linkProviderPlans(prisma, users.providers.lucas.id, plans, [
		"Techniker Krankenkasse",
		"AOK",
		"Privat",
	]);

	for (const [key, provider] of Object.entries(PROVIDERS)) {
		const providerUser = users.providers[key];

		if (!providerUser || !("acceptedInsurancePlanNames" in provider)) {
			continue;
		}

		await linkProviderPlans(
			prisma,
			providerUser.id,
			plans,
			provider.acceptedInsurancePlanNames as string[],
		);
	}

	await linkUserPlans(prisma, users.customers.lucas.id, plans, [
		"Techniker Krankenkasse",
	]);
	await linkUserPlans(prisma, users.customers.juliana.id, plans, [
		"BARMER",
	]);

	console.log("✅ Health insurance plan links ready");
}
