import type {
	NotificationChannel,
	NotificationDeliveryStatus,
	NotificationType,
	PushPlatform,
	appointment,
	notification_delivery,
	notification_preference,
	patient_profile,
	push_token,
	user,
} from "../../../../prisma/generated/prisma/client";

export type RegisterPushTokenData = {
	userId: string;
	token: string;
	platform: PushPlatform;
	deviceId?: string | null;
};

export type NotificationPreferenceInput = {
	type: NotificationType;
	pushEnabled: boolean;
	emailEnabled: boolean;
};

export type AppointmentForNotification = appointment & {
	customer: user | null;
	patientProfile: patient_profile | null;
	healthcareProvider: user;
};

export type CreateDeliveryData = {
	userId: string;
	type: NotificationType;
	channel: NotificationChannel;
	appointmentId?: string | null;
	dedupeKey?: string | null;
	status: NotificationDeliveryStatus;
	expoTicketId?: string | null;
	errorMessage?: string | null;
	sentAt?: Date | null;
};

export type NotificationsRepository = {
	upsertPushToken: (data: RegisterPushTokenData) => Promise<push_token>;
	deactivatePushToken: (userId: string, token: string) => Promise<void>;
	deactivatePushTokens: (tokens: string[]) => Promise<void>;
	findActivePushTokensByUserId: (userId: string) => Promise<push_token[]>;
	findPreferencesByUserId: (
		userId: string,
	) => Promise<notification_preference[]>;
	upsertPreferences: (
		userId: string,
		preferences: NotificationPreferenceInput[],
	) => Promise<notification_preference[]>;
	findDelivery: (
		userId: string,
		type: NotificationType,
		channel: NotificationChannel,
		dedupeKey: string,
	) => Promise<notification_delivery | null>;
	createDelivery: (
		data: CreateDeliveryData,
		) => Promise<notification_delivery>;
	findUpcomingAppointmentsForReminderWindow: (
		now: Date,
		until: Date,
	) => Promise<AppointmentForNotification[]>;
	findBirthdayGreetingCandidates: () => Promise<AppointmentForNotification[]>;
};
