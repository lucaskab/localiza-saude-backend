import { recurringAppointmentsService } from "@/http/services/recurring-appointments-service";
import type { user } from "../../../../prisma/generated/prisma/client";
import type { UpdateAppointmentRecurringSeriesBodySchema } from "@/schemas/routes/appointment-recurring-series/update-appointment-recurring-series";

export const updateAppointmentRecurringSeriesUseCase = {
	async execute(
		currentUser: user,
		seriesId: string,
		data: UpdateAppointmentRecurringSeriesBodySchema,
	) {
		return recurringAppointmentsService.updateSeries(seriesId, {
			currentUser,
			notes: data.notes,
			recurrence: data.recurrence,
		});
	},
};
