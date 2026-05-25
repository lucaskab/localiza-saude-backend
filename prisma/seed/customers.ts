import { getCustomerFormattedAddress } from "./addresses";
import type { SeedClient, SeedPatientProfiles, SeedUsers } from "./types";

export async function seedCustomerData(
	prisma: SeedClient,
	users: SeedUsers,
): Promise<SeedPatientProfiles> {
	console.log("🧾 Seeding customer profiles and medical records...");

	await prisma.customer_medical_record.createMany({
		data: [
			{
				customerId: users.customers.lucas.id,
				bloodType: "O+",
				medications: "Vitamina D semanal",
				chronicPain: "Dor lombar eventual após longos períodos sentado.",
				preExistingConditions: "Rinite alérgica",
				allergies: "Dipirona",
				surgeries: "Apendicectomia em 2014",
				familyHistory: "Histórico familiar de hipertensão.",
				lifestyleNotes: "Corre 3 vezes por semana e trabalha em home office.",
				emergencyContactName: "Mariana Furini",
				emergencyContactPhone: "+5511999992001",
			},
			{
				customerId: users.customers.juliana.id,
				bloodType: "A-",
				medications: "Nenhuma medicação contínua",
				chronicPain: null,
				preExistingConditions: "Nenhuma condição relevante",
				allergies: "Não informado",
				surgeries: null,
				familyHistory: "Histórico familiar de diabetes tipo 2.",
				lifestyleNotes: "Pratica musculação e ciclismo.",
				emergencyContactName: "Paula Furini",
				emergencyContactPhone: "+5511999992002",
			},
		],
	});

	const lucasSelf = await prisma.patient_profile.create({
		data: {
			fullName: users.customers.lucas.name,
			dateOfBirth: new Date("1994-02-14T00:00:00.000Z"),
			cpf: "123.456.789-10",
			phone: users.customers.lucas.phone,
			email: users.customers.lucas.email,
			address: getCustomerFormattedAddress(users.customers.lucas.id),
			gender: "Feminino",
			relationshipToCustomer: "Titular",
			customerOwnerId: users.customers.lucas.id,
			bloodType: "O+",
			medications: "Vitamina D semanal",
			allergies: "Dipirona",
			emergencyContactName: "Mariana Furini",
			emergencyContactPhone: "+5511999992001",
		},
	});

	const lucasFamily = await prisma.patient_profile.create({
		data: {
			fullName: "Mariana Furini",
			dateOfBirth: new Date("1996-06-30T00:00:00.000Z"),
			cpf: "222.333.444-55",
			phone: "+5511999992001",
			email: "mariana.furini.seed@example.com",
			address: getCustomerFormattedAddress(users.customers.lucas.id),
			gender: "Feminino",
			relationshipToCustomer: "Cônjuge",
			customerOwnerId: users.customers.lucas.id,
			bloodType: "B+",
			allergies: "Nenhuma conhecida",
			notes: "Perfil dependente usado para agendamentos familiares.",
		},
	});

	const julianaSelf = await prisma.patient_profile.create({
		data: {
			fullName: users.customers.juliana.name,
			dateOfBirth: new Date("1992-08-22T00:00:00.000Z"),
			cpf: "987.654.321-00",
			phone: users.customers.juliana.phone,
			email: users.customers.juliana.email,
			address: getCustomerFormattedAddress(users.customers.juliana.id),
			gender: "Masculino",
			relationshipToCustomer: "Titular",
			customerOwnerId: users.customers.juliana.id,
			bloodType: "A-",
			preExistingConditions: "Nenhuma condição relevante",
		},
	});

	console.log("✅ Created customer medical records and patient profiles");

	return {
		lucasSelf,
		lucasFamily,
		julianaSelf,
	};
}
