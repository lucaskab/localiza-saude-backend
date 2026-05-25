import { z } from "zod";
import {
	customerUserSchema,
	healthcareProviderUserSchema,
} from "@/schemas/routes/users/user";
import { onboardingUserSchema } from "@/schemas/routes/auth/complete-onboarding";

export const getAuthMeResponseSchema = z.object({
	user: onboardingUserSchema.extend({
		role: z.enum(["CUSTOMER", "HEALTHCARE_PROVIDER", "STAFF", "ADMIN"]),
	}),
	customer: customerUserSchema.nullable(),
	healthcareProvider: healthcareProviderUserSchema.nullable(),
});

export const getAuthMeRouteOptions = {
	schema: {
		tags: ["Auth"],
		summary: "Get the authenticated user's authoritative session state",
		security: [{ bearerAuth: [] }],
		response: {
			200: getAuthMeResponseSchema,
		},
	},
};
