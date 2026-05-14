import { recurringAppointmentsService } from "@/http/services/recurring-appointments";
import type { user } from "../../../../prisma/generated/prisma/client";

export const deleteAppointmentRecurringSeriesUseCase = {
	async execute(currentUser: user, seriesId: string) {
		await recurringAppointmentsService.cancelSeries(seriesId, currentUser);

		return {
			message: "Recurring appointment cancelled successfully",
		};
	},
};
