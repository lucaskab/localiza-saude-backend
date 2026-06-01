import type { SeedClient } from "./types";

export const HEALTH_INSURANCE_PLAN_NAMES = [
	"AOK",
	"Allianz Private",
	"BARMER",
	"DAK-Gesundheit",
	"Debeka",
	"HEK",
	"IKK classic",
	"KKH",
	"Pronova BKK",
	"Selbstzahler",
	"Signal Iduna",
	"TK Dental",
	"Techniker Krankenkasse",
	"Privat",
	"Debeka Dental",
] as const;

export type SeedHealthInsurancePlans = Record<
	(typeof HEALTH_INSURANCE_PLAN_NAMES)[number],
	{ id: string; name: string }
>;

export async function seedHealthInsurancePlans(
	prisma: SeedClient,
): Promise<SeedHealthInsurancePlans> {
	console.log("🏥 Seeding health insurance plans...");

	const plans = {} as SeedHealthInsurancePlans;

	for (const name of HEALTH_INSURANCE_PLAN_NAMES) {
		const plan = await prisma.health_insurance_plan.upsert({
			where: { name },
			update: { active: true },
			create: { name },
		});

		plans[name] = plan;
	}

	console.log(`✅ Seeded ${HEALTH_INSURANCE_PLAN_NAMES.length} health insurance plans`);

	return plans;
}
