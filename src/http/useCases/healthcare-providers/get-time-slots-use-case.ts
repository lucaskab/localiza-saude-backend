import { prisma } from "@/database/prisma";
import { prismaAppointmentRepository } from "@/http/repositories/appointments/appointments-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";

type TimeSlot = {
	startTime: string;
	endTime: string;
	available: boolean;
};

type GetTimeSlotsParams = {
	healthcareProviderId: string;
	date: string;
	procedureIds: string[];
};

type GetTimeSlotsResponse = {
	date: string;
	healthcareProviderId: string;
	totalDurationMinutes: number;
	slotIntervalMinutes: number;
	workingHours: {
		startTime: string;
		endTime: string;
	};
	slots: TimeSlot[];
};

function timeToMinutes(time: string): number {
	const [hours = 0, minutes = 0] = time.split(":").map(Number);
	return hours * 60 + minutes;
}

function minutesToTime(minutes: number): string {
	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;
	return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

function getDayOfWeek(date: Date): number {
	return date.getUTCDay();
}

function hasTimeOverlap(
	slotStart: number,
	slotEnd: number,
	apptStart: number,
	apptEnd: number,
): boolean {
	return slotStart < apptEnd && slotEnd > apptStart;
}

function parseUtcDateString(date: string): Date {
	const [year, month, day] = date.split("-").map(Number);
	return new Date(Date.UTC(year || 0, (month || 1) - 1, day || 1));
}

export const getTimeSlotsUseCase = {
	async execute(params: GetTimeSlotsParams): Promise<GetTimeSlotsResponse> {
		const { healthcareProviderId, date, procedureIds } = params;

		// Validate healthcare provider exists
		const provider = await prisma.healthcare_provider.findUnique({
			where: { id: healthcareProviderId },
		});

		if (!provider) {
			throw new BadRequestError("Healthcare provider not found");
		}

		// Validate procedures
		if (!procedureIds || procedureIds.length === 0) {
			throw new BadRequestError("At least one procedure must be specified");
		}

		const selectedProcedures = await prisma.procedure.findMany({
			where: {
				id: { in: procedureIds },
				healthcareProviderId,
			},
		});

		if (selectedProcedures.length !== procedureIds.length) {
			throw new BadRequestError(
				"One or more procedures not found or do not belong to this provider",
			);
		}

		// Calculate total duration of selected procedures
		const totalDurationMinutes = selectedProcedures.reduce(
			(total, proc) => total + proc.durationInMinutes,
			0,
		);

		// Get ALL procedures from this provider to find the shortest one
		const allProviderProcedures = await prisma.procedure.findMany({
			where: { healthcareProviderId },
			orderBy: { durationInMinutes: "asc" },
		});

		if (allProviderProcedures.length === 0) {
			throw new BadRequestError(
				"Healthcare provider has no procedures configured",
			);
		}

		// Slot interval is the duration of the shortest procedure
		const shortestProcedure = allProviderProcedures[0];
		if (!shortestProcedure) {
			throw new BadRequestError(
				"Healthcare provider has no procedures configured",
			);
		}
		const slotIntervalMinutes = shortestProcedure.durationInMinutes;

		// Parse date as UTC to keep slot generation independent from server timezone
		const dateObj = parseUtcDateString(date);
		const dayOfWeek = getDayOfWeek(dateObj);

		// Get provider's schedule for this day
		const schedule = await prisma.healthcare_provider_schedule.findFirst({
			where: {
				healthcareProviderId,
				dayOfWeek,
				isActive: true,
			},
		});

		// If no schedule, return empty slots
		if (!schedule) {
			return {
				date,
				healthcareProviderId,
				totalDurationMinutes,
				slotIntervalMinutes,
				workingHours: {
					startTime: "00:00",
					endTime: "00:00",
				},
				slots: [],
			};
		}

		// Get existing appointments for this day
		const startOfDay = new Date(dateObj);
		startOfDay.setUTCHours(0, 0, 0, 0);
		const endOfDay = new Date(dateObj);
		endOfDay.setUTCHours(23, 59, 59, 999);

		const existingAppointments =
			await prismaAppointmentRepository.findByProviderAndDateRange(
				healthcareProviderId,
				{
					startDate: startOfDay,
					endDate: endOfDay,
				},
			);

		// Convert working hours to minutes
		const startMinutes = timeToMinutes(schedule.startTime);
		const endMinutes = timeToMinutes(schedule.endTime);

		// Generate ALL possible slots
		const slots: TimeSlot[] = [];

		for (
			let currentStart = startMinutes;
			currentStart < endMinutes;
			currentStart += slotIntervalMinutes
		) {
			const currentEnd = currentStart + slotIntervalMinutes;

			// Check if this slot can fit the total duration of selected procedures
			const canFitProcedures =
				currentStart + totalDurationMinutes <= endMinutes;

			if (!canFitProcedures) {
				// Slot exists but cannot fit the procedures
				slots.push({
					startTime: minutesToTime(currentStart),
					endTime: minutesToTime(currentEnd),
					available: false,
				});
				continue;
			}

			// Check for conflicts with existing appointments
			// We need to check if the entire duration (not just this slot) would conflict
			const procedureEndTime = currentStart + totalDurationMinutes;
			let hasConflict = false;

			for (const appointment of existingAppointments) {
				const apptDate = new Date(appointment.scheduledAt);
				const apptStart =
					apptDate.getUTCHours() * 60 + apptDate.getUTCMinutes();
				const apptEnd = apptStart + appointment.totalDurationMinutes;

				if (
					hasTimeOverlap(currentStart, procedureEndTime, apptStart, apptEnd)
				) {
					hasConflict = true;
					break;
				}
			}

			slots.push({
				startTime: minutesToTime(currentStart),
				endTime: minutesToTime(currentEnd),
				available: !hasConflict,
			});
		}

		return {
			date,
			healthcareProviderId,
			totalDurationMinutes,
			slotIntervalMinutes,
			workingHours: {
				startTime: schedule.startTime,
				endTime: schedule.endTime,
			},
			slots,
		};
	},
};
