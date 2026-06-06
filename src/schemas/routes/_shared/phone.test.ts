import { describe, expect, test } from "bun:test";
import { phoneSchema, normalizePhone } from "./phone";

describe("phone helpers", () => {
	test("accepts a national brazilian phone number", () => {
		expect(normalizePhone("(11) 99999-1001")).toBe("11999991001");
	});

	test("accepts a brazilian phone number with country code", () => {
		expect(normalizePhone("+55 (11) 99999-1001")).toBe("11999991001");
		expect(normalizePhone("5511999991001")).toBe("11999991001");
	});

	test("rejects unsupported phone lengths", () => {
		expect(() => normalizePhone("123")).toThrow("Phone must contain 10 or 11 digits");
	});

	test("schema reports invalid phone numbers", () => {
		const result = phoneSchema().safeParse("123");

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0]?.message).toBe("Invalid phone number");
		}
	});
});
