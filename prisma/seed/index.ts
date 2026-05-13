import { seedAppointments } from "./appointments";
import { seedAuthFixtures } from "./auth-fixtures";
import { seedSchedulesAndProcedures } from "./catalog";
import { seedCategories } from "./categories";
import { cleanupSeedData } from "./cleanup";
import { seedClinics } from "./clinics";
import { seedConversations } from "./conversations";
import { seedCustomerData } from "./customers";
import { seedEngagement } from "./engagement";
import { seedProviderFaqs, seedProviderVerification } from "./providers";
import { seedProfessionalCouncils } from "./professional-councils";
import { seedScheduleExceptions } from "./schedule-exceptions";
import type { SeedClient } from "./types";
import { seedUsers } from "./users";

export async function runSeed(prisma: SeedClient) {
	console.log("🌱 Starting Localiza Saúde seed...");
	console.log(
		"🔐 Better Auth accounts/sessions are preserved so social login keeps working.",
	);

	await cleanupSeedData(prisma);

	await seedProfessionalCouncils(prisma);
	const users = await seedUsers(prisma);
	await seedAuthFixtures(prisma, users);
	const categories = await seedCategories(prisma, users);
	const clinics = await seedClinics(prisma, users);
	await seedProviderFaqs(prisma, users);
	await seedProviderVerification(prisma, users);
	const procedures = await seedSchedulesAndProcedures(prisma, users);
	await seedScheduleExceptions(prisma, users);
	const patientProfiles = await seedCustomerData(prisma, users);
	const appointments = await seedAppointments(
		prisma,
		users,
		procedures,
		patientProfiles,
	);
	await seedConversations(prisma, users, appointments);
	await seedEngagement(prisma, users, appointments);

	console.log("\n📊 Seed summary");
	console.log("==============");
	console.log("Real login users:");
	console.log(
		`  CUSTOMER ${users.customers.lucas.email} (${users.customers.lucas.id})`,
	);
	console.log(
		`  PROVIDER ${users.providers.lucas.email} (${users.providers.lucas.id})`,
	);
	console.log(`  ADMIN    ${users.admin.email} (${users.admin.id})`);
	console.log(`Seed providers: ${Object.keys(users.providers).length}`);
	console.log(`Seed staff users: ${Object.keys(users.staff).length}`);
	console.log(`Categories: ${Object.keys(categories).length}`);
	console.log(`Clinics: ${Object.keys(clinics).length}`);
	console.log(`Procedures: ${Object.keys(procedures).length}`);
	console.log(`Patient profiles: ${Object.keys(patientProfiles).length}`);
	console.log(`Appointments: ${Object.keys(appointments).length}`);

	console.log("\nUseful IDs:");
	console.log(`  SAMPLE_PROVIDER_VERIFIED_ID=${users.providers.ana.id}`);
	console.log(`  SAMPLE_PROVIDER_PENDING_ID=${users.providers.marina.id}`);
	console.log(`  SAMPLE_PROVIDER_REJECTED_ID=${users.providers.rafael.id}`);
	console.log(`  SAMPLE_CLINIC_ID=${clinics.paulista.id}`);
	console.log(`  SAMPLE_ONLINE_APPOINTMENT_ID=${appointments.lucasCardio.id}`);
	console.log(
		`  SAMPLE_RESCHEDULE_APPOINTMENT_ID=${appointments.lucasNutrition.id}`,
	);
	console.log("\n✨ Seed completed successfully!");
}
