type AppointmentLike = {
	recurringSeries?: {
		rules?: unknown[];
		[key: string]: unknown;
	} | null;
	[key: string]: unknown;
};

export function presentAppointment<T extends AppointmentLike | null>(
	appointment: T,
): T {
	if (!appointment?.recurringSeries) {
		return appointment;
	}

	const { rules, ...recurringSeries } = appointment.recurringSeries;

	return {
		...appointment,
		recurringSeries: {
			...recurringSeries,
			weeklySlots: rules ?? [],
		},
	} as T;
}

export function presentAppointments<T extends AppointmentLike>(
	appointments: T[],
) {
	return appointments.map((appointment) => presentAppointment(appointment));
}
