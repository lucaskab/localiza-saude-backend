import { z } from "zod";
import { healthcareProviderSchema } from "../healthcare-providers/get-healthcare-providers";
import { publicUserSchema } from "../users/user";

export const providerVerificationStatusSchema = z.enum([
	"PENDING",
	"VERIFIED",
	"REJECTED",
]);

export const providerVerificationReviewStatusSchema = z.enum([
	"APPROVED",
	"REJECTED",
]);

export const providerVerificationReviewSchema = z.object({
	id: z.cuid(),
	healthcareProviderId: z.cuid(),
	reviewerUserId: z.cuid(),
	reviewerUser: publicUserSchema.optional(),
	status: providerVerificationReviewStatusSchema,
	reason: z.string().nullable(),
	internalNotes: z.string().nullable(),
	documentKey: z.string().nullable(),
	documentSha256: z.string().nullable(),
	createdAt: z.date(),
});

export const adminProviderVerificationSchema = healthcareProviderSchema.extend({
	verifiedByUser: publicUserSchema.nullable().optional(),
	providerVerificationReviews: z.array(providerVerificationReviewSchema),
});

export const getAdminProviderVerificationsQuerySchema = z.object({
	status: providerVerificationStatusSchema.optional(),
	search: z.string().trim().optional(),
	limit: z.coerce.number().int().min(1).max(50).default(20),
	offset: z.coerce.number().int().min(0).default(0),
});

export const providerVerificationParamsSchema = z.object({
	id: z.cuid(),
});

export const approveProviderVerificationBodySchema = z.object({
	internalNotes: z.string().trim().max(1000).nullable().optional(),
});

export const rejectProviderVerificationBodySchema = z.object({
	reason: z.string().trim().min(1).max(1000),
	internalNotes: z.string().trim().max(1000).nullable().optional(),
});

export const getAdminProviderVerificationsResponseSchema = z.object({
	healthcareProviders: z.array(adminProviderVerificationSchema),
	total: z.number().int(),
	limit: z.number().int(),
	offset: z.number().int(),
	hasMore: z.boolean(),
});

export const getAdminProviderVerificationResponseSchema = z.object({
	healthcareProvider: adminProviderVerificationSchema,
});

export const providerVerificationDocumentResponseSchema = z.object({
	document: z.object({
		url: z.url(),
		expiresInSeconds: z.number().int(),
		fileName: z.string().nullable(),
		fileSize: z.number().int().nullable(),
		mimeType: z.string().nullable(),
		sha256: z.string().nullable(),
		uploadedAt: z.date().nullable(),
	}),
});

export type GetAdminProviderVerificationsQuerySchema = z.infer<
	typeof getAdminProviderVerificationsQuerySchema
>;
export type ProviderVerificationParamsSchema = z.infer<
	typeof providerVerificationParamsSchema
>;
export type ApproveProviderVerificationBodySchema = z.infer<
	typeof approveProviderVerificationBodySchema
>;
export type RejectProviderVerificationBodySchema = z.infer<
	typeof rejectProviderVerificationBodySchema
>;

export const getAdminProviderVerificationsRouteOptions = {
	schema: {
		tags: ["Admin"],
		summary: "List provider verification requests",
		security: [{ bearerAuth: [] }],
		querystring: getAdminProviderVerificationsQuerySchema,
		response: {
			200: getAdminProviderVerificationsResponseSchema,
		},
	},
};

export const getAdminProviderVerificationRouteOptions = {
	schema: {
		tags: ["Admin"],
		summary: "Get provider verification details",
		security: [{ bearerAuth: [] }],
		params: providerVerificationParamsSchema,
		response: {
			200: getAdminProviderVerificationResponseSchema,
		},
	},
};

export const approveProviderVerificationRouteOptions = {
	schema: {
		tags: ["Admin"],
		summary: "Approve a provider verification",
		security: [{ bearerAuth: [] }],
		params: providerVerificationParamsSchema,
		body: approveProviderVerificationBodySchema,
		response: {
			200: getAdminProviderVerificationResponseSchema,
		},
	},
};

export const rejectProviderVerificationRouteOptions = {
	schema: {
		tags: ["Admin"],
		summary: "Reject a provider verification",
		security: [{ bearerAuth: [] }],
		params: providerVerificationParamsSchema,
		body: rejectProviderVerificationBodySchema,
		response: {
			200: getAdminProviderVerificationResponseSchema,
		},
	},
};

export const getProviderVerificationDocumentRouteOptions = {
	schema: {
		tags: ["Admin"],
		summary: "Create a temporary URL for provider verification document",
		security: [{ bearerAuth: [] }],
		params: providerVerificationParamsSchema,
		response: {
			200: providerVerificationDocumentResponseSchema,
		},
	},
};
