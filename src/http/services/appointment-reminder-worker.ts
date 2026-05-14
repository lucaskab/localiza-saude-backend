import { sendCustomerBirthdayGreetingsUseCase } from "@/http/useCases/notifications/send-customer-birthday-greetings-use-case";
import { sendDueAppointmentRemindersUseCase } from "@/http/useCases/notifications/send-due-appointment-reminders-use-case";

const FIFTEEN_MINUTES_IN_MS = 15 * 60 * 1000;

let workerStarted = false;

export function startAppointmentReminderWorker() {
	if (workerStarted || process.env.NODE_ENV === "test") {
		return;
	}

	workerStarted = true;

	const run = async () => {
		try {
			const [reminderResult, birthdayResult] = await Promise.all([
				sendDueAppointmentRemindersUseCase.execute(),
				sendCustomerBirthdayGreetingsUseCase.execute(),
			]);

			if (reminderResult.processed > 0) {
				console.log("Appointment reminder worker result:", reminderResult);
			}

			if (birthdayResult.processed > 0 || birthdayResult.sent > 0) {
				console.log("Customer birthday greeting worker result:", birthdayResult);
			}
		} catch (error) {
			console.error("Appointment reminder worker failed:", error);
		}
	};

	setTimeout(run, 30_000);
	setInterval(run, FIFTEEN_MINUTES_IN_MS);
}
