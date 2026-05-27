import { GOOGLE_CALENDAR_SCOPES } from "@/auth";
import { prisma } from "@/database/prisma";
import { env } from "@/env";
import type {
	AppointmentWithRelations,
} from "@/http/repositories/appointments/appointments-repository-contract";
import { prismaAppointmentRepository } from "@/http/repositories/appointments/appointments-repository-implementation";
import { SERVICE_MODALITIES } from "@/schemas/service-modalities";
import type { account } from "../../../prisma/generated/prisma/client";

const googleTokenUrl = "https://oauth2.googleapis.com/token";
const calendarEventUrl =
	"https://www.googleapis.com/calendar/v3/calendars/primary/events";
const meetSpaceUrl = "https://meet.googleapis.com/v2/spaces";

type GoogleTokenResponse = {
	access_token?: string;
	refresh_token?: string;
	expires_in?: number;
	scope?: string;
	token_type?: string;
	error?: string;
	error_description?: string;
};

type GoogleCalendarEventResponse = {
	id?: string;
	hangoutLink?: string;
	conferenceData?: {
		entryPoints?: Array<{
			entryPointType?: string;
			uri?: string;
		}>;
	};
};

export function extractGoogleMeetMeetingCode(meetingUrl: string) {
	try {
		const url = new URL(meetingUrl);

		if (!url.hostname.endsWith("meet.google.com")) {
			return null;
		}

		const meetingCode = url.pathname.replace(/^\//, "").split("/")[0]?.trim();

		return meetingCode || null;
	} catch {
		return null;
	}
}

function parseScopes(scope?: string | null) {
	return scope?.split(/[,\s]+/).filter(Boolean) ?? [];
}

function hasGoogleMeetScopes(account: account) {
	const scopes = parseScopes(account.scope);

	return GOOGLE_CALENDAR_SCOPES.every((scope) => scopes.includes(scope));
}

async function refreshGoogleAccessToken(account: account) {
	if (!account.refreshToken) {
		return null;
	}

	const body = new URLSearchParams({
		client_id: env.GOOGLE_CLIENT_ID,
		client_secret: env.GOOGLE_CLIENT_SECRET,
		grant_type: "refresh_token",
		refresh_token: account.refreshToken,
	});

	const response = await fetch(googleTokenUrl, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body,
	});
	const data = (await response.json()) as GoogleTokenResponse;

	if (!response.ok || !data.access_token) {
		console.error("Failed to refresh Google Calendar access token", data);
		return null;
	}

	const accessTokenExpiresAt = data.expires_in
		? new Date(Date.now() + data.expires_in * 1000)
		: account.accessTokenExpiresAt;

	await prisma.account.update({
		where: { id: account.id },
		data: {
			accessToken: data.access_token,
			...(data.refresh_token ? { refreshToken: data.refresh_token } : {}),
			accessTokenExpiresAt,
			...(data.scope ? { scope: data.scope } : {}),
		},
	});

	return data.access_token;
}

async function getGoogleCalendarAccessToken(userId: string) {
	const account = await prisma.account.findFirst({
		where: {
			userId,
			providerId: "google",
		},
		orderBy: {
			updatedAt: "desc",
		},
	});

	if (!account || !hasGoogleMeetScopes(account)) {
		return null;
	}

	if (
		account.accessToken &&
		(!account.accessTokenExpiresAt ||
			account.accessTokenExpiresAt.getTime() > Date.now() + 60_000)
	) {
		return account.accessToken;
	}

	return refreshGoogleAccessToken(account);
}

function getAppointmentPatientName(appointment: AppointmentWithRelations) {
	return (
		appointment.patientProfile?.fullName ||
		appointment.customer?.name ||
		"Paciente"
	);
}

function getAppointmentPatientEmail(appointment: AppointmentWithRelations) {
	return appointment.patientProfile?.email || appointment.customer?.email || null;
}

function getUniqueAttendees(emails: Array<string | null | undefined>) {
	const uniqueEmails = [
		...new Set(
			emails.filter(
				(email): email is string => Boolean(email && email.includes("@")),
			),
		),
	];

	return uniqueEmails.map((email) => ({ email }));
}

function buildGoogleMeetEventDescription({
	patientName,
	patientEmail,
}: {
	patientName: string;
	patientEmail: string | null;
}) {
	const patientDetails = patientEmail
		? `${patientName} (${patientEmail})`
		: patientName;

	return [
		"Consulta criada automaticamente pela Localiza Saúde.",
		`Paciente: ${patientDetails}`,
		"Participantes entram pelo link do Google Meet e aguardam aprovação do profissional.",
	].join("\n");
}

async function configureGoogleMeetSpace({
	accessToken,
	meetingUrl,
}: {
	accessToken: string;
	meetingUrl: string;
}) {
	const meetingCode = extractGoogleMeetMeetingCode(meetingUrl);

	if (!meetingCode) {
		throw new Error("Invalid Google Meet URL returned by Google Calendar");
	}

	const response = await fetch(
		`${meetSpaceUrl}/${encodeURIComponent(meetingCode)}?updateMask=config.accessType,config.entryPointAccess,config.moderation`,
		{
			method: "PATCH",
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				config: {
					accessType: "RESTRICTED",
					entryPointAccess: "ALL",
					moderation: "ON",
				},
			}),
		},
	);
	const data = (await response.json()) as { error?: unknown };

	if (!response.ok) {
		throw new Error(
			`Failed to configure Google Meet waiting room: ${JSON.stringify(data.error ?? data)}`,
		);
	}
}

async function createGoogleMeetEvent({
	accessToken,
	appointment,
}: {
	accessToken: string;
	appointment: AppointmentWithRelations;
}) {
	const start = new Date(appointment.scheduledAt);
	const end = new Date(
		start.getTime() + appointment.totalDurationMinutes * 60 * 1000,
	);
	const patientName = getAppointmentPatientName(appointment);
	const patientEmail = getAppointmentPatientEmail(appointment);
	const providerName =
		appointment.healthcareProvider.displayName ||
		appointment.healthcareProvider.name;
	const attendees = getUniqueAttendees([appointment.healthcareProvider.email]);

	const response = await fetch(
		`${calendarEventUrl}?conferenceDataVersion=1&sendUpdates=all`,
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				summary: `Consulta online - ${patientName} com ${providerName}`,
				description: buildGoogleMeetEventDescription({
					patientName,
					patientEmail,
				}),
				start: {
					dateTime: start.toISOString(),
				},
				end: {
					dateTime: end.toISOString(),
				},
				attendees,
				conferenceData: {
					createRequest: {
						requestId: `localiza-saude-${appointment.id}`,
						conferenceSolutionKey: {
							type: "hangoutsMeet",
						},
					},
				},
			}),
		},
	);
	const data = (await response.json()) as GoogleCalendarEventResponse & {
		error?: unknown;
	};

	if (!response.ok) {
		throw new Error(
			`Failed to create Google Meet event: ${JSON.stringify(data.error ?? data)}`,
		);
	}

	const meetingUrl =
		data.conferenceData?.entryPoints?.find(
			(entryPoint) => entryPoint.entryPointType === "video",
		)?.uri || data.hangoutLink;

	if (!meetingUrl) {
		throw new Error("Google Calendar did not return a Meet link");
	}

	await configureGoogleMeetSpace({ accessToken, meetingUrl });

	return {
		externalId: data.id ?? null,
		meetingUrl,
	};
}

export const googleMeetService = {
	async ensureOnlineMeeting(appointment: AppointmentWithRelations) {
		if (
			appointment.status !== "CONFIRMED" ||
			appointment.serviceModality !== SERVICE_MODALITIES.ONLINE ||
			appointment.onlineMeetingUrl
		) {
			return appointment;
		}

		const accessToken =
			(await getGoogleCalendarAccessToken(appointment.healthcareProviderId)) ||
			(appointment.customerId
				? await getGoogleCalendarAccessToken(appointment.customerId)
				: null);

		if (!accessToken) {
			throw new Error(
				"Google Calendar authorization is required to create an online appointment link. Reconnect Google to grant Meet settings access.",
			);
		}

		const event = await createGoogleMeetEvent({ accessToken, appointment });

		return prismaAppointmentRepository.update(appointment.id, {
			onlineMeetingUrl: event.meetingUrl,
			onlineMeetingProvider: "GOOGLE_MEET",
			onlineMeetingExternalId: event.externalId,
			onlineMeetingCreatedAt: new Date(),
		});
	},
};
