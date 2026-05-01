import { prisma } from "@/database/prisma";
import type { Prisma } from "../../../../prisma/generated/prisma/client";
import type {
	CreateDeliveryData,
	NotificationsRepository,
	NotificationPreferenceInput,
	RegisterPushTokenData,
} from "./notifications-repository-contract";

const appointmentNotificationInclude = {
	customer: {
		include: {
			user: true,
		},
	},
	patientProfile: true,
	healthcareProvider: {
		include: {
			user: true,
		},
	},
};

export const prismaNotificationsRepository: NotificationsRepository = {
	async upsertPushToken(data: RegisterPushTokenData) {
		return prisma.push_token.upsert({
			where: {
				token: data.token,
			},
			create: {
				userId: data.userId,
				token: data.token,
				platform: data.platform,
				deviceId: data.deviceId,
				isActive: true,
				lastUsedAt: new Date(),
			},
			update: {
				userId: data.userId,
				platform: data.platform,
				deviceId: data.deviceId,
				isActive: true,
				lastUsedAt: new Date(),
			},
		});
	},

	async deactivatePushToken(userId: string, token: string) {
		await prisma.push_token.updateMany({
			where: {
				userId,
				token,
			},
			data: {
				isActive: false,
			},
		});
	},

	async deactivatePushTokens(tokens: string[]) {
		if (tokens.length === 0) {
			return;
		}

		await prisma.push_token.updateMany({
			where: {
				token: {
					in: tokens,
				},
			},
			data: {
				isActive: false,
			},
		});
	},

	async findActivePushTokensByUserId(userId: string) {
		return prisma.push_token.findMany({
			where: {
				userId,
				isActive: true,
			},
		});
	},

	async findPreferencesByUserId(userId: string) {
		return prisma.notification_preference.findMany({
			where: {
				userId,
			},
			orderBy: {
				type: "asc",
			},
		});
	},

	async upsertPreferences(
		userId: string,
		preferences: NotificationPreferenceInput[],
	) {
		return prisma.$transaction(
			preferences.map((preference) =>
				prisma.notification_preference.upsert({
					where: {
						userId_type: {
							userId,
							type: preference.type,
						},
					},
					create: {
						userId,
						type: preference.type,
						enabled: preference.enabled,
					},
					update: {
						enabled: preference.enabled,
					},
				}),
			),
		);
	},

	async findDelivery(userId: string, type, appointmentId: string) {
		return prisma.notification_delivery.findUnique({
			where: {
				userId_type_appointmentId: {
					userId,
					type,
					appointmentId,
				},
			},
		});
	},

	async createDelivery(data: CreateDeliveryData) {
		return prisma.notification_delivery.create({
			data: {
				userId: data.userId,
				type: data.type,
				appointmentId: data.appointmentId,
				status: data.status,
				expoTicketId: data.expoTicketId,
				errorMessage: data.errorMessage,
				sentAt: data.sentAt,
			},
		});
	},

	async findUpcomingAppointmentsMissingReminder(now: Date, until: Date) {
		const where: Prisma.appointmentWhereInput = {
			scheduledAt: {
				gt: now,
				lte: until,
			},
			status: {
				in: ["SCHEDULED", "CONFIRMED"],
			},
			customer: {
				isNot: null,
			},
			notificationDeliveries: {
				none: {
					type: "APPOINTMENT_REMINDER",
				},
			},
		};

		const appointments = await prisma.appointment.findMany({
			where,
			include: appointmentNotificationInclude,
			orderBy: {
				scheduledAt: "asc",
			},
		});

		return appointments;
	},
};
