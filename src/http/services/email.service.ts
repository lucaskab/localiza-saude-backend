import { env } from "@/env";

const RESEND_EMAILS_API_URL = "https://api.resend.com/emails";
const DEFAULT_RESEND_FROM_EMAIL = "Localiza Saúde <onboarding@resend.dev>";

type SendEmailData = {
	to: string;
	subject: string;
	html: string;
	text?: string;
	idempotencyKey?: string;
};

type ResendEmailResponse = {
	id?: string;
	message?: string;
	name?: string;
};

export const emailService = {
	async send({ to, subject, html, text, idempotencyKey }: SendEmailData) {
		if (!env.RESEND_API_KEY) {
			return {
				status: "skipped" as const,
				errorMessage: "Resend is not configured",
			};
		}

		const response = await fetch(RESEND_EMAILS_API_URL, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${env.RESEND_API_KEY}`,
				"Content-Type": "application/json",
				...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
			},
			body: JSON.stringify({
				from: DEFAULT_RESEND_FROM_EMAIL,
				to,
				subject,
				html,
				...(text ? { text } : {}),
			}),
		});
		const payload = (await response.json().catch(() => ({}))) as
			| ResendEmailResponse
			| { error?: ResendEmailResponse };

		if (!response.ok) {
			const errorPayload =
				"error" in payload && payload.error ? payload.error : payload;

			return {
				status: "failed" as const,
				errorMessage:
					"message" in errorPayload && errorPayload.message
						? errorPayload.message
						: "name" in errorPayload && errorPayload.name
							? errorPayload.name
							: `Resend request failed with status ${response.status}`,
			};
		}

		return {
			status: "sent" as const,
			id: "id" in payload ? payload.id : undefined,
		};
	},
};
