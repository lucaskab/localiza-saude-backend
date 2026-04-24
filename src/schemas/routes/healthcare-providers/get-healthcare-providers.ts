import { z } from "zod";
import { procedureSchema } from "../procedures/get-procedures";

const userSchema = z.object({
	id: z.cuid(),
	name: z.string(),
	email: z.email(),
	phone: z.string().nullable().optional(),
	image: z.string().nullable().optional(),
	role: z.enum(["HEALTHCARE_PROVIDER", "CUSTOMER"]),
});

export const healthcareProviderSchema = z.object({
	id: z.cuid(),
	userId: z.cuid(),
	user: userSchema,
	specialty: z.string().nullable().optional(),
	professionalId: z.string().nullable().optional(),
	bio: z.string().nullable().optional(),
	nextAvailableAt: z.date().nullable().optional(),
	averageRating: z.number().optional(),
	totalRatings: z.number().int().optional(),
	procedures: z.array(procedureSchema),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const getHealthcareProvidersResponseSchema = z.object({
	healthcareProviders: z.array(healthcareProviderSchema),
});

export type GetHealthcareProvidersResponseSchema = z.infer<
	typeof getHealthcareProvidersResponseSchema
>;

export const getHealthcareProvidersRouteOptions = {
	schema: {
		tags: ["Healthcare Providers"],
		summary: "Get all healthcare providers",
		response: {
			200: getHealthcareProvidersResponseSchema,
		},
	},
};
