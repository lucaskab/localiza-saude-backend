import { z } from "zod";
import { professionalCouncilSchema } from "../users/user";

export const getProfessionalCouncilsResponseSchema = z.object({
	professionalCouncils: z.array(professionalCouncilSchema),
});

export type GetProfessionalCouncilsResponseSchema = z.infer<
	typeof getProfessionalCouncilsResponseSchema
>;

export const getProfessionalCouncilsRouteOptions = {
	schema: {
		tags: ["Professional Councils"],
		summary: "Get active professional councils",
		response: {
			200: getProfessionalCouncilsResponseSchema,
		},
	},
};
