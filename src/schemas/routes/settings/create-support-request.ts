import { z } from "zod";

export const supportRequestTypeSchema = z.enum([
	"ACCOUNT_DELETION",
	"DATA_DELETION",
	"PROBLEM_REPORT",
	"FEEDBACK",
	"SUPPORT_CONTACT",
]);

export const supportRequestStatusSchema = z.enum([
	"OPEN",
	"IN_REVIEW",
	"RESOLVED",
	"CLOSED",
]);

const trimmedOptionalText = z
	.string()
	.trim()
	.max(160)
	.optional()
	.transform((value) => value || null);

export const createSupportRequestBodySchema = z.object({
	type: supportRequestTypeSchema,
	subject: trimmedOptionalText,
	message: z.string().trim().min(10).max(5000),
	contactEmail: z.string().trim().email().optional().nullable(),
	appVersion: z.string().trim().max(80).optional().nullable(),
	platform: z.string().trim().max(80).optional().nullable(),
	environment: z.string().trim().max(80).optional().nullable(),
});

export const supportRequestSchema = z.object({
	id: z.cuid(),
	userId: z.cuid(),
	type: supportRequestTypeSchema,
	subject: z.string().nullable(),
	message: z.string(),
	contactEmail: z.string().nullable(),
	appVersion: z.string().nullable(),
	platform: z.string().nullable(),
	environment: z.string().nullable(),
	status: supportRequestStatusSchema,
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const createSupportRequestResponseSchema = z.object({
	supportRequest: supportRequestSchema,
});

export type CreateSupportRequestBodySchema = z.infer<
	typeof createSupportRequestBodySchema
>;

export const createSupportRequestRouteOptions = {
	schema: {
		tags: ["Settings"],
		summary: "Create an account, support, problem report, or feedback request",
		security: [{ bearerAuth: [] }],
		body: createSupportRequestBodySchema,
		response: {
			201: createSupportRequestResponseSchema,
		},
	},
};
