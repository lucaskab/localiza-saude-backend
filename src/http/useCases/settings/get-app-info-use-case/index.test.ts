import { describe, expect, test } from "bun:test";

const { getAppInfoUseCase } = await import("./index");

describe("getAppInfoUseCase", () => {
	test("returns static app info and current server time", async () => {
		const result = await getAppInfoUseCase.execute();

		expect(result.app.name).toBe("Localiza Saúde");
		expect(typeof result.app.apiVersion).toBe("string");
		expect(typeof result.app.environment).toBe("string");
		expect(result.app.serverTime).toBeInstanceOf(Date);
	});
});
