import { z } from "zod";
import { addressInputSchema } from "@/schemas/routes/addresses/address";
import { customerSchema } from "./get-customers";

function normalizeDigits(value: string) {
	return value.replace(/\D/g, "");
}

function normalizeCpf(value: string) {
	const digits = normalizeDigits(value);

	if (digits.length !== 11) {
		throw new Error("CPF must contain 11 digits");
	}

	return digits;
}

function normalizePhone(value: string) {
	const digits = normalizeDigits(value);

	if (digits.length < 10 || digits.length > 11) {
		throw new Error("Phone must contain 10 or 11 digits");
	}

	return digits;
}

const cpfSchema = z
	.string()
	.trim()
	.transform((value, ctx) => {
		try {
			return normalizeCpf(value);
		} catch {
			ctx.addIssue({ code: "custom", message: "Invalid CPF" });
			return z.NEVER;
		}
	});

const phoneSchema = z
	.string()
	.trim()
	.transform((value, ctx) => {
		try {
			return normalizePhone(value);
		} catch {
			ctx.addIssue({ code: "custom", message: "Invalid phone number" });
			return z.NEVER;
		}
	});

export const updateCustomerParamsSchema = z.object({
	id: z.cuid(),
});

export const updateCustomerBodySchema = z.object({
	name: z.string().trim().min(2).max(120).optional(),
	phone: phoneSchema.nullable().optional(),
	cpf: cpfSchema.nullable().optional(),
	dateOfBirth: z.coerce.date().nullable().optional(),
	address: addressInputSchema.optional(),
});

export const updateCustomerResponseSchema = z.object({
	customer: customerSchema,
});

export type UpdateCustomerParamsSchema = z.infer<
	typeof updateCustomerParamsSchema
>;
export type UpdateCustomerBodySchema = z.infer<typeof updateCustomerBodySchema>;
export type UpdateCustomerResponseSchema = z.infer<
	typeof updateCustomerResponseSchema
>;

export const updateCustomerRouteOptions = {
	schema: {
		tags: ["Customers"],
		summary: "Update a customer",
		security: [{ bearerAuth: [] }],
		params: updateCustomerParamsSchema,
		body: updateCustomerBodySchema,
		response: {
			200: updateCustomerResponseSchema,
		},
	},
};
