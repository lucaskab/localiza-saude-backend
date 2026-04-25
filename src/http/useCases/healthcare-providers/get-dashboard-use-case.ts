import { prisma } from "@/database/prisma";
import type { GetDashboardResponseSchema } from "@/schemas/routes/healthcare-providers/get-dashboard";

type RecentRating = {
	id: string;
	rating: number;
	comment: string | null;
	customerName: string;
	createdAt: Date;
};

type AppointmentTrend = {
	date: string;
	count: number;
};

type PopularProcedure = {
	procedureId: string;
	procedureName: string;
	count: number;
	revenue: number;
};

export const getDashboardUseCase = {
	async execute(
		healthcareProviderId: string,
	): Promise<GetDashboardResponseSchema> {
		// Get date ranges
		const now = new Date();
		const todayStart = new Date(now);
		todayStart.setHours(0, 0, 0, 0);
		const todayEnd = new Date(now);
		todayEnd.setHours(23, 59, 59, 999);

		const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
		const currentMonthEnd = new Date(
			now.getFullYear(),
			now.getMonth() + 1,
			0,
			23,
			59,
			59,
			999,
		);

		const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
		const lastMonthEnd = new Date(
			now.getFullYear(),
			now.getMonth(),
			0,
			23,
			59,
			59,
			999,
		);

		const weekAgo = new Date(now);
		weekAgo.setDate(weekAgo.getDate() - 7);

		// 1. TODAY'S APPOINTMENTS
		const todayAppointments = await prisma.appointment.findMany({
			where: {
				healthcareProviderId,
				scheduledAt: {
					gte: todayStart,
					lte: todayEnd,
				},
			},
		});

		const todayStats = {
			total: todayAppointments.length,
			scheduled: todayAppointments.filter((a) => a.status === "SCHEDULED")
				.length,
			completed: todayAppointments.filter((a) => a.status === "COMPLETED")
				.length,
			cancelled: todayAppointments.filter((a) => a.status === "CANCELLED")
				.length,
		};

		// 2. MONTHLY REVENUE
		const currentMonthAppointments = await prisma.appointment.findMany({
			where: {
				healthcareProviderId,
				scheduledAt: {
					gte: currentMonthStart,
					lte: currentMonthEnd,
				},
				status: {
					not: "CANCELLED",
				},
			},
			select: {
				totalPriceCents: true,
			},
		});

		const lastMonthAppointments = await prisma.appointment.findMany({
			where: {
				healthcareProviderId,
				scheduledAt: {
					gte: lastMonthStart,
					lte: lastMonthEnd,
				},
				status: {
					not: "CANCELLED",
				},
			},
			select: {
				totalPriceCents: true,
			},
		});

		const currentMonthRevenue = currentMonthAppointments.reduce(
			(sum, a) => sum + a.totalPriceCents,
			0,
		);
		const lastMonthRevenue = lastMonthAppointments.reduce(
			(sum, a) => sum + a.totalPriceCents,
			0,
		);

		const revenueGrowth =
			lastMonthRevenue === 0
				? 100
				: ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;

		// 3. RATINGS
		const ratingsData = await prisma.rating.aggregate({
			where: { healthcareProviderId },
			_avg: {
				rating: true,
			},
			_count: {
				rating: true,
			},
		});

		const recentRatings = await prisma.rating.findMany({
			where: { healthcareProviderId },
			orderBy: {
				createdAt: "desc",
			},
			take: 5,
			include: {
				customer: {
					include: {
						user: {
							select: {
								name: true,
							},
						},
					},
				},
			},
		});

		const recentRatingsFormatted: RecentRating[] = recentRatings.map(
			(r: {
				id: string;
				rating: number;
				comment: string | null;
				createdAt: Date;
				customer: { user: { name: string } };
			}) => ({
				id: r.id,
				rating: r.rating,
				comment: r.comment,
				customerName: r.customer.user.name,
				createdAt: r.createdAt,
			}),
		);

		// 4. APPOINTMENTS METRICS
		const upcomingAppointments = await prisma.appointment.count({
			where: {
				healthcareProviderId,
				scheduledAt: {
					gte: now,
				},
				status: {
					in: ["SCHEDULED", "CONFIRMED"],
				},
			},
		});

		const thisMonthTotal = await prisma.appointment.count({
			where: {
				healthcareProviderId,
				scheduledAt: {
					gte: currentMonthStart,
					lte: currentMonthEnd,
				},
			},
		});

		const lastMonthTotal = await prisma.appointment.count({
			where: {
				healthcareProviderId,
				scheduledAt: {
					gte: lastMonthStart,
					lte: lastMonthEnd,
				},
			},
		});

		const appointmentsGrowth =
			lastMonthTotal === 0
				? 100
				: ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;

		// Week trend - get last 7 days
		const weekTrend: AppointmentTrend[] = [];
		for (let i = 6; i >= 0; i--) {
			const date = new Date(now);
			date.setDate(date.getDate() - i);
			const dayStart = new Date(date);
			dayStart.setHours(0, 0, 0, 0);
			const dayEnd = new Date(date);
			dayEnd.setHours(23, 59, 59, 999);

			const count = await prisma.appointment.count({
				where: {
					healthcareProviderId,
					scheduledAt: {
						gte: dayStart,
						lte: dayEnd,
					},
				},
			});

			weekTrend.push({
				date: date.toISOString().split("T")[0] || "",
				count,
			});
		}

		// 5. PATIENTS
		const allPatientAppointments = await prisma.appointment.findMany({
			where: {
				healthcareProviderId,
			},
			select: {
				customerId: true,
				patientProfileId: true,
				scheduledAt: true,
			},
			orderBy: {
				scheduledAt: "asc",
			},
		});

		const getPatientKey = (appointment: {
			customerId: string | null;
			patientProfileId: string | null;
		}) => {
			if (appointment.patientProfileId) {
				return `patient-profile:${appointment.patientProfileId}`;
			}

			if (appointment.customerId) {
				return `customer:${appointment.customerId}`;
			}

			return null;
		};

		const firstAppointmentsByPatient = new Map<string, Date>();

		for (const appointment of allPatientAppointments) {
			const patientKey = getPatientKey(appointment);

			if (!patientKey) {
				continue;
			}

			if (!firstAppointmentsByPatient.has(patientKey)) {
				firstAppointmentsByPatient.set(patientKey, appointment.scheduledAt);
			}
		}

		let newThisMonth = 0;
		for (const [_, firstAppointment] of firstAppointmentsByPatient) {
			if (
				firstAppointment >= currentMonthStart &&
				firstAppointment <= currentMonthEnd
			) {
				newThisMonth++;
			}
		}

		// 6. POPULAR PROCEDURES
		const proceduresData = await prisma.appointment_procedure.findMany({
			where: {
				appointment: {
					healthcareProviderId,
					scheduledAt: {
						gte: currentMonthStart,
						lte: currentMonthEnd,
					},
				},
			},
			include: {
				procedure: true,
				appointment: {
					select: {
						status: true,
					},
				},
			},
		});

		const procedureStats = new Map<
			string,
			{ name: string; count: number; revenue: number }
		>();

		for (const ap of proceduresData) {
			const id = ap.procedureId;
			const existing = procedureStats.get(id) || {
				name: ap.procedure.name,
				count: 0,
				revenue: 0,
			};

			existing.count++;
			if (ap.appointment.status !== "CANCELLED") {
				existing.revenue += ap.procedure.priceInCents;
			}

			procedureStats.set(id, existing);
		}

		const popularProcedures: PopularProcedure[] = Array.from(
			procedureStats.entries(),
		)
			.map(([procedureId, data]) => ({
				procedureId,
				procedureName: data.name,
				count: data.count,
				revenue: data.revenue,
			}))
			.sort((a, b) => b.count - a.count)
			.slice(0, 5);

		// 7. CANCELLATION RATE
		const thisMonthCancelled = await prisma.appointment.count({
			where: {
				healthcareProviderId,
				scheduledAt: {
					gte: currentMonthStart,
					lte: currentMonthEnd,
				},
				status: "CANCELLED",
			},
		});

		const lastMonthCancelled = await prisma.appointment.count({
			where: {
				healthcareProviderId,
				scheduledAt: {
					gte: lastMonthStart,
					lte: lastMonthEnd,
				},
				status: "CANCELLED",
			},
		});

		const thisMonthCancellationRate =
			thisMonthTotal === 0 ? 0 : (thisMonthCancelled / thisMonthTotal) * 100;
		const lastMonthCancellationRate =
			lastMonthTotal === 0 ? 0 : (lastMonthCancelled / lastMonthTotal) * 100;

		// Return formatted response
		return {
			todayAppointments: todayStats,
			monthlyRevenue: {
				currentMonth: currentMonthRevenue,
				lastMonth: lastMonthRevenue,
				growthPercentage: Number(revenueGrowth.toFixed(2)),
			},
			ratings: {
				averageRating: ratingsData._avg.rating || 0,
				totalRatings: ratingsData._count.rating || 0,
				recentRatings: recentRatingsFormatted,
			},
			appointments: {
				upcomingCount: upcomingAppointments,
				thisMonthTotal,
				lastMonthTotal,
				growthPercentage: Number(appointmentsGrowth.toFixed(2)),
				weekTrend,
			},
			patients: {
				totalUnique: firstAppointmentsByPatient.size,
				newThisMonth,
			},
			popularProcedures,
			cancellationRate: {
				thisMonth: Number(thisMonthCancellationRate.toFixed(2)),
				lastMonth: Number(lastMonthCancellationRate.toFixed(2)),
			},
		};
	},
};
