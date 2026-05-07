import { z } from "zod";
import { healthcareProviderSchema } from "./get-healthcare-providers";

export const licenseDocumentParamsSchema = z.object({
	id: z.cuid(),
});

export const licenseDocumentMetadataSchema = z.object({
	fileName: z.string().nullable(),
	fileSize: z.number().int().nullable(),
	mimeType: z.string().nullable(),
	sha256: z.string().nullable(),
	uploadedAt: z.date().nullable(),
});

export const uploadLicenseDocumentResponseSchema = z.object({
	healthcareProvider: healthcareProviderSchema,
	document: licenseDocumentMetadataSchema,
});

export const getLicenseDocumentUrlResponseSchema = z.object({
	document: licenseDocumentMetadataSchema.extend({
		url: z.url(),
		expiresInSeconds: z.number().int(),
	}),
});

export const deleteLicenseDocumentResponseSchema = z.object({
	healthcareProvider: healthcareProviderSchema,
});

export type LicenseDocumentParamsSchema = z.infer<
	typeof licenseDocumentParamsSchema
>;

export const uploadLicenseDocumentRouteOptions = {
	schema: {
		tags: ["Healthcare Providers"],
		summary: "Upload a private healthcareProvider license document",
		security: [{ bearerAuth: [] }],
		params: licenseDocumentParamsSchema,
		response: {
			201: uploadLicenseDocumentResponseSchema,
		},
	},
};

export const getLicenseDocumentUrlRouteOptions = {
	schema: {
		tags: ["Healthcare Providers"],
		summary: "Create a temporary URL for the healthcareProvider license document",
		security: [{ bearerAuth: [] }],
		params: licenseDocumentParamsSchema,
		response: {
			200: getLicenseDocumentUrlResponseSchema,
		},
	},
};

export const deleteLicenseDocumentRouteOptions = {
	schema: {
		tags: ["Healthcare Providers"],
		summary: "Delete a private healthcareProvider license document",
		security: [{ bearerAuth: [] }],
		params: licenseDocumentParamsSchema,
		response: {
			200: deleteLicenseDocumentResponseSchema,
		},
	},
};
