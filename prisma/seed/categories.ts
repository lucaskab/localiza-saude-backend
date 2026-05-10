import type { SeedCategories, SeedClient, SeedUsers } from "./types";

const categories = [
	{
		key: "cardiology",
		name: "Cardiologia",
		description: "Prevenção e cuidado cardiovascular.",
		providers: ["ana", "lucas"],
	},
	{
		key: "nutrition",
		name: "Nutrição",
		description: "Acompanhamento alimentar, performance e saúde metabólica.",
		providers: ["carlos"],
	},
	{
		key: "psychology",
		name: "Psicologia",
		description: "Saúde mental, ansiedade, terapia e desenvolvimento pessoal.",
		providers: ["marina"],
	},
	{
		key: "physiotherapy",
		name: "Fisioterapia",
		description: "Reabilitação, dor e mobilidade.",
		providers: ["rafael"],
	},
	{
		key: "dermatology",
		name: "Dermatologia",
		description: "Pele, acne, prevenção e estética.",
		providers: ["beatriz"],
	},
	{
		key: "dentistry",
		name: "Odontologia",
		description: "Saúde bucal, estética e reabilitação oral.",
		providers: ["pedro"],
	},
	{
		key: "generalPractice",
		name: "Clínica geral",
		description: "Primeiro atendimento e cuidado longitudinal.",
		providers: ["ana", "lucas"],
	},
];

export async function seedCategories(
	prisma: SeedClient,
	users: SeedUsers,
): Promise<SeedCategories> {
	console.log("📂 Seeding categories...");

	const created: SeedCategories = {};

	for (const category of categories) {
		created[category.key] = await prisma.category.create({
			data: {
				name: category.name,
				description: category.description,
			},
		});
	}

	await prisma.healthcare_provider_category.createMany({
		data: categories.flatMap((category) =>
			category.providers.map((providerKey) => ({
				healthcareProviderId: users.providers[providerKey].id,
				categoryId: created[category.key].id,
			})),
		),
	});

	console.log(`✅ Created ${categories.length} categories`);

	return created;
}
