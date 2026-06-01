import { z } from "zod";

const entityIdSchema = z.string().min(1);

export const healthInsurancePlanSchema = z.object({
	id: entityIdSchema,
	name: z.string(),
});

export type HealthInsurancePlanSchema = z.infer<typeof healthInsurancePlanSchema>;

export const healthInsurancePlanIdsSchema = z.array(entityIdSchema);
