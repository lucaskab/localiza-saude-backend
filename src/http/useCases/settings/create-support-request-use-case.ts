import { prismaSettingsRepository } from "@/http/repositories/settings/settings-repository-implementation";
import type { CreateSupportRequestBodySchema } from "@/schemas/routes/settings/create-support-request";

export const createSupportRequestUseCase = {
	async execute(userId: string, data: CreateSupportRequestBodySchema) {
		const supportRequest =
			await prismaSettingsRepository.createSupportRequest({
				userId,
				type: data.type,
				subject: data.subject,
				message: data.message,
				contactEmail: data.contactEmail,
				appVersion: data.appVersion,
				platform: data.platform,
				environment: data.environment,
			});

		return { supportRequest };
	},
};
