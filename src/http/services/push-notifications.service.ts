import { prismaNotificationsRepository } from "@/http/repositories/notifications/notifications-repository-implementation";
import type { NotificationType } from "../../../prisma/generated/prisma/client";

const EXPO_PUSH_API_URL = "https://exp.host/--/api/v2/push/send";

type ExpoPushTicket =
	| {
			status: "ok";
			id: string;
	  }
	| {
			status: "error";
			message: string;
			details?: {
				error?: string;
			};
	  };

type ExpoPushResponse = {
	data?: ExpoPushTicket | ExpoPushTicket[];
	errors?: { message: string }[];
};

export const notificationTypes: NotificationType[] = [
	"APPOINTMENT_REMINDER",
	"APPOINTMENT_STATUS_UPDATE",
	"NEW_APPOINTMENT_REQUEST",
];

export const defaultNotificationPreferences = notificationTypes.map((type) => ({
	type,
	enabled: true,
}));

type SendPushToUserData = {
	userId: string;
	type: NotificationType;
	title: string;
	body: string;
	data?: Record<string, string | number | boolean | null>;
	appointmentId?: string | null;
	recordDelivery?: boolean;
};

type SendPushToUserResult = {
	status: "sent" | "skipped" | "failed";
	expoTicketId?: string | null;
	errorMessage?: string | null;
};

const isDeviceNotRegistered = (ticket: ExpoPushTicket) =>
	ticket.status === "error" && ticket.details?.error === "DeviceNotRegistered";

export const pushNotificationsService = {
	async getPreferences(userId: string) {
		const persisted =
			await prismaNotificationsRepository.findPreferencesByUserId(userId);
		const persistedByType = new Map(
			persisted.map((preference) => [preference.type, preference.enabled]),
		);

		return defaultNotificationPreferences.map((preference) => ({
			type: preference.type,
			enabled: persistedByType.get(preference.type) ?? preference.enabled,
		}));
	},

	async isPreferenceEnabled(userId: string, type: NotificationType) {
		const preferences = await this.getPreferences(userId);
		return preferences.find((preference) => preference.type === type)?.enabled ?? true;
	},

	async sendToUser({
		userId,
		type,
		title,
		body,
		data,
		appointmentId,
		recordDelivery = false,
	}: SendPushToUserData): Promise<SendPushToUserResult> {
		const preferenceEnabled = await this.isPreferenceEnabled(userId, type);

		if (!preferenceEnabled) {
			if (recordDelivery) {
				await prismaNotificationsRepository.createDelivery({
					userId,
					type,
					appointmentId,
					status: "SKIPPED",
					errorMessage: "Notification preference disabled",
				});
			}

			return { status: "skipped", errorMessage: "Preference disabled" };
		}

		const tokens =
			await prismaNotificationsRepository.findActivePushTokensByUserId(userId);

		if (tokens.length === 0) {
			if (recordDelivery) {
				await prismaNotificationsRepository.createDelivery({
					userId,
					type,
					appointmentId,
					status: "SKIPPED",
					errorMessage: "No active push tokens",
				});
			}

			return { status: "skipped", errorMessage: "No active push tokens" };
		}

		const messages = tokens.map((pushToken) => ({
			to: pushToken.token,
			sound: "default",
			title,
			body,
			data: {
				...data,
				type,
				appointmentId: appointmentId ?? null,
			},
		}));

		try {
			const response = await fetch(EXPO_PUSH_API_URL, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(messages),
			});
			const payload = (await response.json()) as ExpoPushResponse;

			if (!response.ok || payload.errors?.length) {
				const errorMessage =
					payload.errors?.map((error) => error.message).join("; ") ||
					`Expo push request failed with status ${response.status}`;

				if (recordDelivery) {
					await prismaNotificationsRepository.createDelivery({
						userId,
						type,
						appointmentId,
						status: "FAILED",
						errorMessage,
					});
				}

				return { status: "failed", errorMessage };
			}

			const tickets = Array.isArray(payload.data)
				? payload.data
				: payload.data
					? [payload.data]
					: [];
			const inactiveTokens = tickets
				.map((ticket, index) =>
					isDeviceNotRegistered(ticket) ? tokens[index]?.token : null,
				)
				.filter((token): token is string => Boolean(token));

			await prismaNotificationsRepository.deactivatePushTokens(inactiveTokens);

			const successfulTicket = tickets.find((ticket) => ticket.status === "ok");
			const failedTicket = tickets.find((ticket) => ticket.status === "error");

			if (successfulTicket?.status === "ok") {
				if (recordDelivery) {
					await prismaNotificationsRepository.createDelivery({
						userId,
						type,
						appointmentId,
						status: "SENT",
						expoTicketId: successfulTicket.id,
						sentAt: new Date(),
					});
				}

				return { status: "sent", expoTicketId: successfulTicket.id };
			}

			const errorMessage =
				failedTicket?.status === "error"
					? failedTicket.message
					: "Expo push service did not return a successful ticket";

			if (recordDelivery) {
				await prismaNotificationsRepository.createDelivery({
					userId,
					type,
					appointmentId,
					status: "FAILED",
					errorMessage,
				});
			}

			return { status: "failed", errorMessage };
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown push notification error";

			if (recordDelivery) {
				await prismaNotificationsRepository.createDelivery({
					userId,
					type,
					appointmentId,
					status: "FAILED",
					errorMessage,
				});
			}

			return { status: "failed", errorMessage };
		}
	},
};
