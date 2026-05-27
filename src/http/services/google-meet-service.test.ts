import { describe, expect, test } from "bun:test";
import { extractGoogleMeetMeetingCode } from "./google-meet-service";

describe("extractGoogleMeetMeetingCode", () => {
	test("extracts the meeting code from a standard Meet URL", () => {
		expect(
			extractGoogleMeetMeetingCode("https://meet.google.com/abc-defg-hij"),
		).toBe("abc-defg-hij");
	});

	test("returns null for invalid URLs", () => {
		expect(extractGoogleMeetMeetingCode("not-a-url")).toBeNull();
		expect(
			extractGoogleMeetMeetingCode("https://example.com/abc-defg-hij"),
		).toBeNull();
	});
});
