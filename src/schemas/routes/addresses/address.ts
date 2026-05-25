import { z } from "zod";

const BRAZILIAN_STATES = [
	"AC",
	"AL",
	"AP",
	"AM",
	"BA",
	"CE",
	"DF",
	"ES",
	"GO",
	"MA",
	"MT",
	"MS",
	"MG",
	"PA",
	"PB",
	"PR",
	"PE",
	"PI",
	"RJ",
	"RN",
	"RS",
	"RO",
	"RR",
	"SC",
	"SP",
	"SE",
	"TO",
] as const;

function normalizeDigits(value: string) {
	return value.replace(/\D/g, "");
}

function formatPostalCode(value: string) {
	const digits = normalizeDigits(value);

	if (digits.length === 8) {
		return `${digits.slice(0, 5)}-${digits.slice(5)}`;
	}

	return digits;
}

export const addressTypeSchema = z.enum([
	"HOME",
	"BILLING",
	"CLINIC",
	"WORK",
	"OTHER",
]);

export const addressInputSchema = z.object({
	type: addressTypeSchema.default("HOME"),
	label: z.string().trim().max(100).nullable().optional(),
	countryCode: z
		.string()
		.trim()
		.toUpperCase()
		.length(2)
		.default("BR"),
	postalCode: z
		.string()
		.trim()
		.transform(formatPostalCode)
		.refine((value) => normalizeDigits(value).length === 8, {
			message: "Postal code must contain 8 digits",
		}),
	state: z
		.string()
		.trim()
		.toUpperCase()
		.refine((value) => BRAZILIAN_STATES.includes(value as (typeof BRAZILIAN_STATES)[number]), {
			message: "Invalid Brazilian state",
		}),
	city: z.string().trim().min(2).max(120),
	neighborhood: z.string().trim().min(2).max(120),
	street: z.string().trim().min(2).max(200),
	number: z.string().trim().min(1).max(20),
	complement: z.string().trim().max(120).nullable().optional(),
	reference: z.string().trim().max(200).nullable().optional(),
});

export const addressSchema = addressInputSchema.extend({
	id: z.cuid(),
	ownerType: z.enum(["USER", "CLINIC"]),
	ownerId: z.string(),
	isPrimary: z.boolean(),
	latitude: z.number().nullable(),
	longitude: z.number().nullable(),
	formattedAddress: z.string().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export type AddressInputSchema = z.infer<typeof addressInputSchema>;
export type AddressSchema = z.infer<typeof addressSchema>;

export function buildFormattedAddress(input: AddressInputSchema) {
	const parts = [
		`${input.street}, ${input.number}`,
		input.complement,
		input.neighborhood,
		`${input.city} - ${input.state}`,
		input.postalCode,
		input.countryCode === "BR" ? "Brasil" : input.countryCode,
	].filter(Boolean);

	return parts.join(", ");
}
