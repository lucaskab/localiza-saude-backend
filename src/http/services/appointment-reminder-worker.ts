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
			const result = await sendDueAppointmentRemindersUseCase.execute();
			if (result.processed > 0) {
				console.log("Appointment reminder worker result:", result);
			}
		} catch (error) {
			console.error("Appointment reminder worker failed:", error);
		}
	};

	setTimeout(run, 30_000);
	setInterval(run, FIFTEEN_MINUTES_IN_MS);
}
