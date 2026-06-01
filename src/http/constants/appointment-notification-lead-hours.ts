export const MIN_APPOINTMENT_NOTIFICATION_LEAD_HOURS = 1;
export const MAX_APPOINTMENT_NOTIFICATION_LEAD_HOURS = 168;
export const DEFAULT_APPOINTMENT_CONFIRMATION_REMINDER_HOURS = 24;

export const APPOINTMENT_CONFIRMATION_REMINDER_PRESETS = [12, 24, 48, 72] as const;

export function normalizeAppointmentNotificationLeadHours(
	value: number | null | undefined,
	fallback = DEFAULT_APPOINTMENT_CONFIRMATION_REMINDER_HOURS,
) {
	return Math.min(
		Math.max(value ?? fallback, MIN_APPOINTMENT_NOTIFICATION_LEAD_HOURS),
		MAX_APPOINTMENT_NOTIFICATION_LEAD_HOURS,
	);
}
