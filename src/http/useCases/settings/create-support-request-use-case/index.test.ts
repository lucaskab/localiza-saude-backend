import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { CreateSupportRequestData } from "@/http/repositories/settings/settings-repository-contract";
import type { CreateSupportRequestBodySchema } from "@/schemas/routes/settings/create-support-request";
import type { support_request } from "../../../../../prisma/generated/prisma/client";

const makeSupportRequest = (data: CreateSupportRequestData): support_request => ({
	id: "cmsupport0001",
	userId: data.userId,
	type: data.type,
	subject: data.subject ?? null,
	message: data.message,
	contactEmail: data.contactEmail ?? null,
	appVersion: data.appVersion ?? null,
	platform: data.platform ?? null,
	environment: data.environment ?? null,
	status: "OPEN",
	createdAt: new Date("2026-08-01T10:00:00.000Z"),
	updatedAt: new Date("2026-08-01T10:00:00.000Z"),
});

const mockSettingsRepository = {
	createSupportRequest: mock(
		(data: CreateSupportRequestData): Promise<support_request> =>
			Promise.resolve(makeSupportRequest(data)),
	),
};

mock.module("@/http/repositories/settings/settings-repository-implementation", () => ({
	prismaSettingsRepository: mockSettingsRepository,
}));

const { createSupportRequestUseCase } = await import("./index");

describe("createSupportRequestUseCase", () => {
	beforeEach(() => {
		mockSettingsRepository.createSupportRequest.mockReset();
		mockSettingsRepository.createSupportRequest.mockImplementation(
			(data: CreateSupportRequestData): Promise<support_request> =>
				Promise.resolve(makeSupportRequest(data)),
		);
	});

	test("creates a support request", async () => {
		const data: CreateSupportRequestBodySchema = {
			type: "PROBLEM_REPORT",
			subject: "Erro ao enviar arquivo",
			message: "Nao consigo enviar um anexo no chat do provider.",
			contactEmail: "lucas@example.com",
			appVersion: "1.0.0",
			platform: "web",
			environment: "development",
		};

		const result = await createSupportRequestUseCase.execute("user-1", data);

		expect(mockSettingsRepository.createSupportRequest).toHaveBeenCalledWith({
			userId: "user-1",
			type: "PROBLEM_REPORT",
			subject: "Erro ao enviar arquivo",
			message: "Nao consigo enviar um anexo no chat do provider.",
			contactEmail: "lucas@example.com",
			appVersion: "1.0.0",
			platform: "web",
			environment: "development",
		});
		expect(result.supportRequest.status).toBe("OPEN");
	});
});
