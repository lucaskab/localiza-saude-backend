import { prisma } from "@/database/prisma";
import type {
	CreateSupportRequestData,
	SettingsRepository,
} from "./settings-repository-contract";

export const prismaSettingsRepository: SettingsRepository = {
	async createSupportRequest(data: CreateSupportRequestData) {
		return prisma.support_request.create({
			data: {
				userId: data.userId,
				type: data.type,
				subject: data.subject,
				message: data.message,
				contactEmail: data.contactEmail,
				appVersion: data.appVersion,
				platform: data.platform,
				environment: data.environment,
			},
		});
	},

	async findSupportRequestsByUserId(userId: string) {
		return prisma.support_request.findMany({
			where: {
				userId,
			},
			orderBy: {
				createdAt: "desc",
			},
		});
	},
};
