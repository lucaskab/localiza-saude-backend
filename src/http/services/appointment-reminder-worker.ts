import { sendDueAppointmentConfirmationRemindersUseCase } from "@/http/useCases/notifications/send-due-appointment-confirmation-reminders-use-case";
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
			const [confirmationReminderResult, reminderResult, birthdayResult] = await Promise.all([
				sendDueAppointmentConfirmationRemindersUseCase.execute(),
				sendDueAppointmentRemindersUseCase.execute(),
				sendCustomerBirthdayGreetingsUseCase.execute(),
			]);

			if (confirmationReminderResult.processed > 0) {
				console.log(
					"Appointment confirmation reminder worker result:",
					confirmationReminderResult,
				);
			}

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
