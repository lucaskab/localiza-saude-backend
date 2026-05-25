import { sendDueAppointmentConfirmationRemindersUseCase } from "@/http/useCases/notifications/send-due-appointment-confirmation-reminders-use-case";
import { sendCustomerBirthdayGreetingsUseCase } from "@/http/useCases/notifications/send-customer-birthday-greetings-use-case";
import { sendDueAppointmentRemindersUseCase } from "@/http/useCases/notifications/send-due-appointment-reminders-use-case";

const FIFTEEN_MINUTES_IN_MS = 15 * 60 * 1000;
const MAX_RETRY_ATTEMPTS = 3;
const INITIAL_RETRY_DELAY_MS = 1_000;

const TRANSIENT_DB_ERROR_CODES = new Set([
	"ECONNRESET",
	"ETIMEDOUT",
	"ECONNREFUSED",
	"EHOSTUNREACH",
	"P1001",
	"P1017",
]);

let workerStarted = false;

type WorkerSummary = {
	processed: number;
	sent: number;
	skipped: number;
	failed: number;
};

function isTransientDatabaseError(error: unknown): boolean {
	if (!error || typeof error !== "object") {
		return false;
	}

	const withCode = error as { code?: unknown; message?: unknown };
	const code =
		typeof withCode.code === "string" ? withCode.code.toUpperCase() : "";
	const message = typeof withCode.message === "string" ? withCode.message : "";
	const normalizedMessage = message.toUpperCase();

	if (code && TRANSIENT_DB_ERROR_CODES.has(code)) {
		return true;
	}

	return (
		normalizedMessage.includes("ECONNRESET") ||
		normalizedMessage.includes(
			"BEFORE SECURE TLS CONNECTION WAS ESTABLISHED",
		) ||
		normalizedMessage.includes("CONNECTION WAS CLOSED") ||
		normalizedMessage.includes("CAN'T REACH DATABASE SERVER") ||
		normalizedMessage.includes("TIMED OUT")
	);
}

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runWithTransientDbRetry<T>(
	jobName: string,
	task: () => Promise<T>,
): Promise<T> {
	let attempt = 0;

	while (attempt < MAX_RETRY_ATTEMPTS) {
		attempt += 1;

		try {
			return await task();
		} catch (error) {
			const shouldRetry =
				attempt < MAX_RETRY_ATTEMPTS && isTransientDatabaseError(error);

			if (!shouldRetry) {
				throw error;
			}

			const delay = INITIAL_RETRY_DELAY_MS * 2 ** (attempt - 1);
			console.warn(
				`${jobName} failed with transient DB error (attempt ${attempt}/${MAX_RETRY_ATTEMPTS}). Retrying in ${delay}ms...`,
				error,
			);
			await sleep(delay);
		}
	}

	throw new Error(`${jobName} failed after ${MAX_RETRY_ATTEMPTS} attempts.`);
}

function logWorkerResult(logLabel: string, result: WorkerSummary) {
	if (result.processed > 0 || result.sent > 0 || result.failed > 0) {
		console.log(logLabel, result);
	}
}

export function startAppointmentReminderWorker() {
	if (workerStarted || process.env.NODE_ENV === "test") {
		return;
	}

	workerStarted = true;

	const run = async () => {
		try {
			const [
				confirmationReminderResult,
				reminderResult,
				birthdayResult,
			] = await Promise.allSettled([
				runWithTransientDbRetry(
					"Appointment confirmation reminder worker",
					() => sendDueAppointmentConfirmationRemindersUseCase.execute(),
				),
				runWithTransientDbRetry("Appointment reminder worker", () =>
					sendDueAppointmentRemindersUseCase.execute(),
				),
				runWithTransientDbRetry("Customer birthday greeting worker", () =>
					sendCustomerBirthdayGreetingsUseCase.execute(),
				),
			]);

			if (confirmationReminderResult.status === "fulfilled") {
				logWorkerResult(
					"Appointment confirmation reminder worker result:",
					confirmationReminderResult.value,
				);
			} else {
				console.error(
					"Appointment confirmation reminder worker failed:",
					confirmationReminderResult.reason,
				);
			}

			if (reminderResult.status === "fulfilled") {
				logWorkerResult(
					"Appointment reminder worker result:",
					reminderResult.value,
				);
			} else {
				console.error("Appointment reminder worker failed:", reminderResult.reason);
			}

			if (birthdayResult.status === "fulfilled") {
				logWorkerResult(
					"Customer birthday greeting worker result:",
					birthdayResult.value,
				);
			} else {
				console.error(
					"Customer birthday greeting worker failed:",
					birthdayResult.reason,
				);
			}
		} catch (error) {
			console.error("Appointment reminder worker failed:", error);
		}
	};

	setTimeout(run, 30_000);
	setInterval(run, FIFTEEN_MINUTES_IN_MS);
}
