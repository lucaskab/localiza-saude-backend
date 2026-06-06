import { z } from "zod";

function normalizeDigits(value: string) {
	return value.replace(/\D/g, "");
}

export function normalizePhone(value: string) {
	const digits = normalizeDigits(value);

	if (digits.length === 10 || digits.length === 11) {
		return digits;
	}

	if (
		(digits.length === 12 || digits.length === 13) &&
		digits.startsWith("55")
	) {
		const nationalDigits = digits.slice(2);

		if (nationalDigits.length === 10 || nationalDigits.length === 11) {
			return nationalDigits;
		}
	}

	throw new Error("Phone must contain 10 or 11 digits");
}

export function phoneSchema(message = "Invalid phone number") {
	return z.string().trim().transform((value, ctx) => {
		try {
			return normalizePhone(value);
		} catch {
			ctx.addIssue({ code: "custom", message });
			return z.NEVER;
		}
	});
}
