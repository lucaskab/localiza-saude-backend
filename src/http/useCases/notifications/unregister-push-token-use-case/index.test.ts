import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { UnregisterPushTokenBodySchema } from "@/schemas/routes/notifications/unregister-push-token";

const mockNotificationsRepository = {
	deactivatePushToken: mock((_: string, __: string): Promise<void> => Promise.resolve()),
};

mock.module(
	"@/http/repositories/notifications/notifications-repository-implementation",
	() => ({
		prismaNotificationsRepository: mockNotificationsRepository,
	}),
);

const { unregisterPushTokenUseCase } = await import("./index");

describe("unregisterPushTokenUseCase", () => {
	beforeEach(() => {
		mockNotificationsRepository.deactivatePushToken.mockReset();
		mockNotificationsRepository.deactivatePushToken.mockResolvedValue(undefined);
	});

	test("deactivates the token and returns success", async () => {
		const data: UnregisterPushTokenBodySchema = {
			token: "ExponentPushToken[test]",
		};

		const result = await unregisterPushTokenUseCase.execute("user-1", data);

		expect(mockNotificationsRepository.deactivatePushToken).toHaveBeenCalledWith(
			"user-1",
			"ExponentPushToken[test]",
		);
		expect(result).toEqual({ success: true });
	});
});
