import type {
	SupportRequestStatus,
	SupportRequestType,
	support_request,
} from "../../../../prisma/generated/prisma/client";

export type CreateSupportRequestData = {
	userId: string;
	type: SupportRequestType;
	subject?: string | null;
	message: string;
	contactEmail?: string | null;
	appVersion?: string | null;
	platform?: string | null;
	environment?: string | null;
};

export type SupportRequest = support_request;

export interface SettingsRepository {
	createSupportRequest(data: CreateSupportRequestData): Promise<SupportRequest>;
	findSupportRequestsByUserId(userId: string): Promise<SupportRequest[]>;
}

export type { SupportRequestStatus, SupportRequestType };
