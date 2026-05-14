import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { RegisterPushTokenData } from "@/http/repositories/notifications/notifications-repository-contract";
import type { RegisterPushTokenBodySchema } from "@/schemas/routes/notifications/register-push-token";
import type { push_token } from "../../../../../prisma/generated/prisma/client";

const makePushToken = (data: RegisterPushTokenData): push_token => ({
	id: "push-token-1",
	userId: data.userId,
	token: data.token,
	platform: data.platform,
	deviceId: data.deviceId ?? null,
	isActive: true,
	lastUsedAt: new Date(),
	createdAt: new Date(),
	updatedAt: new Date(),
});

const mockNotificationsRepository = {
	upsertPushToken: mock((data: RegisterPushTokenData): Promise<push_token> =>
		Promise.resolve(makePushToken(data)),
	),
};

mock.module(
	"@/http/repositories/notifications/notifications-repository-implementation",
	() => ({
		prismaNotificationsRepository: mockNotificationsRepository,
	}),
);

const { registerPushTokenUseCase } = await import("./index");

describe("registerPushTokenUseCase", () => {
	beforeEach(() => {
		mockNotificationsRepository.upsertPushToken.mockReset();
		mockNotificationsRepository.upsertPushToken.mockImplementation(
			(data: RegisterPushTokenData): Promise<push_token> =>
				Promise.resolve(makePushToken(data)),
		);
	});

	test("registers push token and returns public shape", async () => {
		const data: RegisterPushTokenBodySchema = {
			token: "ExponentPushToken[test]",
			platform: "WEB",
			deviceId: "device-1",
		};

		const result = await registerPushTokenUseCase.execute("user-1", data);

		expect(mockNotificationsRepository.upsertPushToken).toHaveBeenCalledWith({
			userId: "user-1",
			token: "ExponentPushToken[test]",
			platform: "WEB",
			deviceId: "device-1",
		});
		expect(result.pushToken).toEqual({
			id: "push-token-1",
			token: "ExponentPushToken[test]",
			platform: "WEB",
			isActive: true,
		});
	});
});
