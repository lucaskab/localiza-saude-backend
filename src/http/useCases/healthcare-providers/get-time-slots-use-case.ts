import { prisma } from "@/database/prisma";
import { prismaAppointmentRepository } from "@/http/repositories/appointments/appointments-repository-implementation";
import { prismaHealthcareProviderScheduleExceptionRepository } from "@/http/repositories/healthcare-provider-schedule-exceptions/healthcare-provider-schedule-exceptions-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import { recurringAppointmentsService } from "@/http/services/recurring-appointments";
import {
	endOfUtcDay,
	getBookingWindowEndDate,
	getCurrentSaoPauloDateTime,
	getDayOfWeek,
	getRangeBounds,
	hasTimeOverlap,
	isValidRange,
	minutesToTime,
	parseUtcDateString,
	timeToMinutes,
	type TimeSlot,
} from "./get-time-slots-helpers";

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

export const getTimeSlotsUseCase = {
	async execute(params: GetTimeSlotsParams): Promise<GetTimeSlotsResponse> {
		const { healthcareProviderId, date, procedureIds } = params;

		// Validate healthcare provider exists
		const provider = await prisma.user.findUnique({
			where: { id: healthcareProviderId },
			select: {
				id: true,
				bookingAvailabilityDays: true,
			},
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
		const currentSaoPauloDateTime = getCurrentSaoPauloDateTime();
		const isTodayInSaoPaulo = date === currentSaoPauloDateTime.date;
		const bookingWindowEnd = getBookingWindowEndDate(
			provider.bookingAvailabilityDays,
		);

		if (endOfUtcDay(dateObj) > bookingWindowEnd) {
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

		await recurringAppointmentsService.ensureProviderRecurringAppointmentsUpToDate(
			healthcareProviderId,
			dateObj,
		);
		const dayOfWeek = getDayOfWeek(dateObj);

		// Get provider's recurring schedule and date-specific exceptions.
		const recurringSchedules = await prisma.healthcare_provider_schedule.findMany({
			where: {
				healthcareProviderId,
				dayOfWeek,
				isActive: true,
			},
			orderBy: {
				startTime: "asc",
			},
		});

		const scheduleExceptions =
			(
				await prismaHealthcareProviderScheduleExceptionRepository.findByHealthcareProviderId(
					healthcareProviderId,
					{
						from: dateObj,
						to: dateObj,
					},
				)
			).filter((exception) => exception.isActive);

		const hasFullDayOff = scheduleExceptions.some(
			(exception) =>
				exception.type === "DAY_OFF" &&
				(!exception.startTime || !exception.endTime),
		);

		if (hasFullDayOff) {
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

		const specialHourRanges = scheduleExceptions
			.filter(
				(exception) =>
					exception.type === "SPECIAL_HOURS" &&
					exception.startTime &&
					exception.endTime,
			)
			.map((exception) => ({
				startTime: exception.startTime as string,
				endTime: exception.endTime as string,
			}))
			.filter(isValidRange);

		const baseRanges =
			specialHourRanges.length > 0
				? specialHourRanges
				: recurringSchedules
						.map((schedule) => ({
							startTime: schedule.startTime,
							endTime: schedule.endTime,
						}))
						.filter(isValidRange);

		const extraSlotRanges = scheduleExceptions
			.filter(
				(exception) =>
					exception.type === "EXTRA_SLOT" &&
					exception.startTime &&
					exception.endTime,
			)
			.map((exception) => ({
				startTime: exception.startTime as string,
				endTime: exception.endTime as string,
			}))
			.filter(isValidRange);

		const workingRanges = [...baseRanges, ...extraSlotRanges].sort(
			(a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime),
		);

		if (workingRanges.length === 0) {
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

		const blockedRanges = scheduleExceptions
			.filter(
				(exception) =>
					["DAY_OFF", "TIME_BLOCK"].includes(exception.type) &&
					exception.startTime &&
					exception.endTime,
			)
			.map((exception) => ({
				startTime: exception.startTime as string,
				endTime: exception.endTime as string,
			}))
			.filter(isValidRange);

		// Get existing appointments for this day
		const startOfDay = new Date(dateObj);
		startOfDay.setUTCHours(0, 0, 0, 0);
		const endOfDay = new Date(dateObj);
		endOfDay.setUTCHours(23, 59, 59, 999);

		const existingAppointments =
			await prismaAppointmentRepository.findByProfessionalAndDateRange(
				healthcareProviderId,
				{
					startDate: startOfDay,
					endDate: endOfDay,
				},
			);

		// Generate ALL possible slots
		const slotsByStartTime = new Map<string, TimeSlot>();

		for (const range of workingRanges) {
			const startMinutes = timeToMinutes(range.startTime);
			const endMinutes = timeToMinutes(range.endTime);

			for (
				let currentStart = startMinutes;
				currentStart < endMinutes;
				currentStart += slotIntervalMinutes
			) {
				const currentEnd = currentStart + slotIntervalMinutes;
				const procedureEndTime = currentStart + totalDurationMinutes;
				const canFitProcedures = procedureEndTime <= endMinutes;

				let hasConflict = false;

				if (canFitProcedures) {
					for (const appointment of existingAppointments) {
						const apptDate = new Date(appointment.scheduledAt);
						const apptStart =
							apptDate.getUTCHours() * 60 + apptDate.getUTCMinutes();
						const apptEnd = apptStart + appointment.totalDurationMinutes;

						if (
							hasTimeOverlap(
								currentStart,
								procedureEndTime,
								apptStart,
								apptEnd,
							)
						) {
							hasConflict = true;
							break;
						}
					}
				}

				if (canFitProcedures && !hasConflict) {
					for (const block of blockedRanges) {
						const blockStart = timeToMinutes(block.startTime);
						const blockEnd = timeToMinutes(block.endTime);

						if (
							hasTimeOverlap(
								currentStart,
								procedureEndTime,
								blockStart,
								blockEnd,
							)
						) {
							hasConflict = true;
							break;
						}
					}
				}

				const isPastSlotInSaoPaulo =
					isTodayInSaoPaulo &&
					currentStart < currentSaoPauloDateTime.minutes;

				const slot = {
					startTime: minutesToTime(currentStart),
					endTime: minutesToTime(currentEnd),
					available:
						canFitProcedures && !hasConflict && !isPastSlotInSaoPaulo,
				};
				const existingSlot = slotsByStartTime.get(slot.startTime);

				if (!existingSlot || (!existingSlot.available && slot.available)) {
					slotsByStartTime.set(slot.startTime, slot);
				}
			}
		}

		const slots = Array.from(slotsByStartTime.values()).sort(
			(a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime),
		);
		const workingHours = getRangeBounds(workingRanges);

		return {
			date,
			healthcareProviderId,
			totalDurationMinutes,
			slotIntervalMinutes,
			workingHours,
			slots,
		};
	},
};
