import { z } from "zod";
import { addressSchema } from "../addresses/address";
import { publicUserSchema } from "../users/user";

export const clinicTypeSchema = z.enum([
	"MEDICAL",
	"HEALTH",
	"DENTAL",
	"EYE",
	"BEAUTY",
	"FREE",
]);

export const clinicSchema = z.object({
	id: z.cuid(),
	name: z.string(),
	phone: z.string(),
	description: z.string().nullable(),
	email: z.email(),
	type: clinicTypeSchema,
	primaryAddress: addressSchema.nullable().optional(),
	createdAt: z.date(),
	updatedAt: z.date(),
	ownerId: z.cuid(),
});

export const clinicEmployeeRoleSchema = z.enum(["OWNER", "PROVIDER", "STAFF"]);

export const clinicPermissionSchema = z.enum([
	"MANAGE_PROVIDER_PROFILE",
	"MANAGE_PROVIDER_SCHEDULE",
	"MANAGE_APPOINTMENTS",
	"MANAGE_PROCEDURES",
	"VIEW_PATIENTS",
	"MANAGE_CLINIC_INFO",
	"MANAGE_STAFF",
]);

export const clinicEmployeeSchema = z.object({
	id: z.cuid(),
	clinicId: z.cuid(),
	userId: z.cuid(),
	user: publicUserSchema.optional(),
	role: clinicEmployeeRoleSchema,
	permissions: z.array(clinicPermissionSchema),
	active: z.boolean(),
	createdAt: z.date(),
	updatedAt: z.date(),
});

export const clinicWithEmployeesSchema = clinicSchema.extend({
	employees: z.array(clinicEmployeeSchema).optional(),
});

export const getClinicsResponseSchema = z.object({
	clinics: z.array(clinicSchema),
});

export type GetClinicsResponseSchema = z.infer<typeof getClinicsResponseSchema>;

export const getClinicsRouteOptions = {
	schema: {
		tags: ["Clinics"],
		summary: "Get all clinics",
		security: [{ bearerAuth: [] }],
		response: {
			200: getClinicsResponseSchema,
		},
	},
};
