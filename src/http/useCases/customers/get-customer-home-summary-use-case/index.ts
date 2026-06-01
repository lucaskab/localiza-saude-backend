import { prisma } from "@/database/prisma";
import type { GetCustomerHomeSummaryResponseSchema } from "@/schemas/routes/customers/get-customer-home-summary";

const UPCOMING_APPOINTMENT_STATUSES = [
	"SCHEDULED",
	"CONFIRMED",
	"IN_PROGRESS",
] as const;

export const getCustomerHomeSummaryUseCase = {
	async execute(
		customerId: string,
	): Promise<GetCustomerHomeSummaryResponseSchema> {
		const [totalAppointments, upcomingAppointments, favoritesCount] =
			await Promise.all([
				prisma.appointment.count({
					where: { customerId },
				}),
				prisma.appointment.count({
					where: {
						customerId,
						status: { in: [...UPCOMING_APPOINTMENT_STATUSES] },
					},
				}),
				prisma.customer_favorite_provider.count({
					where: { customerId },
				}),
			]);

		return {
			summary: {
				totalAppointments,
				upcomingAppointments,
				favoritesCount,
			},
		};
	},
};
