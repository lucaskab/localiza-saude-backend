import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
	console.log("🌱 Starting database seed...");

	// Delete all data before seeding (in correct order due to foreign keys)
	console.log("🗑️  Cleaning existing data...");
	await prisma.session.deleteMany({});
	await prisma.account.deleteMany({});
	await prisma.clinic.deleteMany({});
	await prisma.user.deleteMany({});

	// Create Users
	console.log("👥 Creating users...");

	const owner1 = await prisma.user.create({
		data: {
			name: "Dr. Ana Silva",
			firstName: "Ana",
			lastName: "Silva",
			phone: "+5511999887766",
			email: "ana.silva@email.com",
			emailVerified: true,
			role: "HEALTHCARE_PROVIDER",
		},
	});

	const owner2 = await prisma.user.create({
		data: {
			name: "Dr. Carlos Santos",
			firstName: "Carlos",
			lastName: "Santos",
			phone: "+5521988776655",
			email: "carlos.santos@email.com",
			emailVerified: true,
			role: "HEALTHCARE_PROVIDER",
		},
	});

	const owner3 = await prisma.user.create({
		data: {
			name: "Dra. Maria Oliveira",
			firstName: "Maria",
			lastName: "Oliveira",
			phone: "+5511977665544",
			email: "maria.oliveira@email.com",
			emailVerified: true,
			role: "HEALTHCARE_PROVIDER",
		},
	});

	const owner4 = await prisma.user.create({
		data: {
			name: "Dr. João Ferreira",
			firstName: "João",
			lastName: "Ferreira",
			phone: "+5521966554433",
			email: "joao.ferreira@email.com",
			emailVerified: true,
			role: "HEALTHCARE_PROVIDER",
		},
	});

	const owner5 = await prisma.user.create({
		data: {
			name: "Dra. Beatriz Costa",
			firstName: "Beatriz",
			lastName: "Costa",
			phone: "+5511955443322",
			email: "beatriz.costa@email.com",
			emailVerified: true,
			role: "HEALTHCARE_PROVIDER",
		},
	});

	const customer1 = await prisma.user.create({
		data: {
			name: "Lucas Mendes",
			firstName: "Lucas",
			lastName: "Mendes",
			phone: "+5511944332211",
			email: "lucas.mendes@email.com",
			emailVerified: true,
			role: "CUSTOMER",
		},
	});

	const customer2 = await prisma.user.create({
		data: {
			name: "Juliana Rodrigues",
			firstName: "Juliana",
			lastName: "Rodrigues",
			phone: "+5521933221100",
			email: "juliana.rodrigues@email.com",
			emailVerified: true,
			role: "CUSTOMER",
		},
	});

	console.log(`✅ Created ${7} users`);

	// Create Clinics with real Brazilian coordinates
	console.log("🏥 Creating clinics...");

	const clinic1 = await prisma.clinic.create({
		data: {
			name: "Centro Médico Paulista",
			phone: "+5511999887766",
			email: "contato@centromedicoPaulista.com",
			description: "Clínica de medicina geral com especialidades médicas",
			type: "MEDICAL",
			latitude: -23.5505,
			longitude: -46.6333,
			ownerId: owner1.id,
		},
	});

	const clinic2 = await prisma.clinic.create({
		data: {
			name: "Clínica Odontológica Sorrisos",
			phone: "+5511988776655",
			email: "contato@sorrisos.com",
			description: "Especializada em odontologia e estética dental",
			type: "DENTAL",
			latitude: -23.5489,
			longitude: -46.6388,
			ownerId: owner2.id,
		},
	});

	const clinic3 = await prisma.clinic.create({
		data: {
			name: "Clínica de Olhos Visão Clara",
			phone: "+5521988776655",
			email: "contato@visaoclara.com",
			description: "Oftalmologia completa com equipamentos modernos",
			type: "EYE",
			latitude: -22.9068,
			longitude: -43.1729,
			ownerId: owner3.id,
		},
	});

	const clinic4 = await prisma.clinic.create({
		data: {
			name: "Spa e Estética Beleza Natural",
			phone: "+5511977665544",
			email: "contato@belezanatural.com",
			description: "Tratamentos estéticos e de beleza",
			type: "BEAUTY",
			latitude: -23.5631,
			longitude: -46.6544,
			ownerId: owner4.id,
		},
	});

	const clinic5 = await prisma.clinic.create({
		data: {
			name: "Centro de Saúde Bem Viver",
			phone: "+5511966554433",
			email: "contato@bemviver.com",
			description: "Centro de saúde e wellness com diversas especialidades",
			type: "HEALTH",
			latitude: -23.5558,
			longitude: -46.6396,
			ownerId: owner5.id,
		},
	});

	const clinic6 = await prisma.clinic.create({
		data: {
			name: "UBS Vila Mariana",
			phone: "+5511955443322",
			email: "ubs.vilamariana@saude.gov.br",
			description: "Unidade Básica de Saúde - Atendimento gratuito pelo SUS",
			type: "FREE",
			latitude: -23.5880,
			longitude: -46.6361,
			ownerId: owner1.id,
		},
	});

	const clinic7 = await prisma.clinic.create({
		data: {
			name: "Hospital São Lucas",
			phone: "+5521999887766",
			email: "contato@hospitalsaolucas.com",
			description: "Hospital geral com pronto atendimento 24h",
			type: "MEDICAL",
			latitude: -22.9711,
			longitude: -43.1822,
			ownerId: owner2.id,
		},
	});

	const clinic8 = await prisma.clinic.create({
		data: {
			name: "Clínica Dental Ipanema",
			phone: "+5521988776655",
			email: "contato@dentalipanema.com",
			description: "Odontologia de excelência na Zona Sul",
			type: "DENTAL",
			latitude: -22.9838,
			longitude: -43.2043,
			ownerId: owner3.id,
		},
	});

	const clinic9 = await prisma.clinic.create({
		data: {
			name: "Centro Médico Jardins",
			phone: "+5511944332211",
			email: "contato@medicojardins.com",
			description: "Clínica médica multiespecialidades",
			type: "MEDICAL",
			latitude: -23.5685,
			longitude: -46.6641,
			ownerId: owner4.id,
		},
	});

	const clinic10 = await prisma.clinic.create({
		data: {
			name: "Clínica de Saúde Integrada",
			phone: "+5511933221100",
			email: "contato@saudeintegrada.com",
			description: "Saúde e bem-estar com abordagem integrativa",
			type: "HEALTH",
			latitude: -23.5475,
			longitude: -46.6361,
			ownerId: owner5.id,
		},
	});

	console.log(`✅ Created ${10} clinics`);

	// Add employees to some clinics
	console.log("👨‍⚕️ Adding employees to clinics...");

	await prisma.clinic.update({
		where: { id: clinic1.id },
		data: {
			employees: {
				connect: [{ id: owner2.id }, { id: owner3.id }],
			},
		},
	});

	await prisma.clinic.update({
		where: { id: clinic7.id },
		data: {
			employees: {
				connect: [{ id: owner4.id }, { id: owner5.id }],
			},
		},
	});

	console.log("✅ Added employees to clinics");

	// Summary
	console.log("\n📊 Seed Summary:");
	console.log("================");
	console.log(`👥 Users: ${7} (${5} providers, ${2} customers)`);
	console.log(`🏥 Clinics: ${10}`);
	console.log(
		`   - MEDICAL: ${3} clinics\n   - DENTAL: ${2} clinics\n   - EYE: ${1} clinic\n   - BEAUTY: ${1} clinic\n   - HEALTH: ${2} clinics\n   - FREE: ${1} clinic`,
	);
	console.log("\n📍 Locations:");
	console.log("   - São Paulo: 7 clinics");
	console.log("   - Rio de Janeiro: 3 clinics");

	console.log("\n✨ Seed completed successfully!");
	console.log("\n📝 Sample User Credentials:");
	console.log("================");
	console.log("Providers:");
	console.log(`  - ana.silva@email.com (Owner: ${clinic1.name})`);
	console.log(`  - carlos.santos@email.com (Owner: ${clinic2.name})`);
	console.log(`  - maria.oliveira@email.com (Owner: ${clinic3.name})`);
	console.log(`  - joao.ferreira@email.com (Owner: ${clinic4.name})`);
	console.log(`  - beatriz.costa@email.com (Owner: ${clinic5.name})`);
	console.log("\nCustomers:");
	console.log("  - lucas.mendes@email.com");
	console.log("  - juliana.rodrigues@email.com");

	console.log("\n🔑 Sample Clinic IDs for testing:");
	console.log(`  - ${clinic1.id} (${clinic1.name})`);
	console.log(`  - ${clinic2.id} (${clinic2.name})`);
	console.log(`  - ${clinic3.id} (${clinic3.name})`);
	console.log(`  - ${clinic7.id} (${clinic7.name})`);

	console.log("\n🧪 Test nearby search with:");
	console.log("  São Paulo (Paulista Ave): latitude=-23.5505&longitude=-46.6333");
	console.log("  Rio (Copacabana): latitude=-22.9711&longitude=-43.1822");
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error("❌ Error during seed:", e);
		await prisma.$disconnect();
		process.exit(1);
	});
