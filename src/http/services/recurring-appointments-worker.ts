import { recurringAppointmentsService } from "@/http/services/recurring-appointments-service";

const ONE_HOUR_IN_MS = 60 * 60 * 1000;

let workerStarted = false;

export function startRecurringAppointmentsWorker() {
	if (workerStarted || process.env.NODE_ENV === "test") {
		return;
	}

	workerStarted = true;

	const run = async () => {
		try {
			await recurringAppointmentsService.runWorkerSync();
		} catch (error) {
			console.error("Recurring appointments worker failed:", error);
		}
	};

	setTimeout(run, 45_000);
	setInterval(run, ONE_HOUR_IN_MS);
}
