import { SEED_FAKE_USER_EMAILS } from "./constants";
import type { SeedClient } from "./types";

export async function cleanupSeedData(prisma: SeedClient) {
	console.log("🗑️  Cleaning application data...");

	await prisma.session.deleteMany({
		where: {
			token: {
				startsWith: "seed-session-",
			},
		},
	});
	await prisma.account.deleteMany({
		where: {
			providerId: "seed-google",
		},
	});
	await prisma.verification.deleteMany({
		where: {
			identifier: {
				startsWith: "seed:",
			},
		},
	});
	await prisma.provider_verification_document_access_log.deleteMany({});
	await prisma.provider_verification_review.deleteMany({});
	await prisma.notification_delivery.deleteMany({});
	await prisma.notification_preference.deleteMany({});
	await prisma.push_token.deleteMany({});
	await prisma.support_request.deleteMany({});
	await prisma.rating.deleteMany({});
	await prisma.customer_favorite_provider.deleteMany({});
	await prisma.customer_medical_record.deleteMany({});
	await prisma.appointment_reschedule_request.deleteMany({});
	await prisma.conversation_message.deleteMany({});
	await prisma.conversation.deleteMany({});
	await prisma.appointment_procedure.deleteMany({});
	await prisma.appointment_waitlist_entry_procedure.deleteMany({});
	await prisma.appointment_waitlist_entry.deleteMany({});
	await prisma.appointment.deleteMany({});
	await prisma.patient_profile.deleteMany({});
	await prisma.healthcare_provider_schedule_exception.deleteMany({});
	await prisma.healthcare_provider_schedule.deleteMany({});
	await prisma.procedure.deleteMany({});
	await prisma.healthcare_provider_faq.deleteMany({});
	await prisma.healthcare_provider_category.deleteMany({});
	await prisma.category.deleteMany({});
	await prisma.clinic_employee.deleteMany({});
	await prisma.clinic.deleteMany({});
	await prisma.user.deleteMany({
		where: {
			email: {
				in: SEED_FAKE_USER_EMAILS,
			},
		},
	});

	console.log("✅ Application data cleaned");
}
