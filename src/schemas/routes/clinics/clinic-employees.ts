import { z } from "zod";
import {
	clinicEmployeeRoleSchema,
	clinicEmployeeSchema,
	clinicPermissionSchema,
} from "./get-clinics";

export const clinicEmployeeParamsSchema = z.object({
	clinicId: z.cuid(),
});

export const clinicEmployeeUserParamsSchema = clinicEmployeeParamsSchema.extend({
	userId: z.cuid(),
});

export const upsertClinicEmployeeBodySchema = z.object({
	userEmail: z.email(),
	role: clinicEmployeeRoleSchema.exclude(["OWNER"]),
	permissions: z.array(clinicPermissionSchema).optional(),
});

export const updateClinicEmployeeBodySchema = z.object({
	role: clinicEmployeeRoleSchema.exclude(["OWNER"]).optional(),
	permissions: z.array(clinicPermissionSchema).optional(),
	active: z.boolean().optional(),
});

export const clinicEmployeesResponseSchema = z.object({
	employees: z.array(clinicEmployeeSchema),
});

export const clinicEmployeeResponseSchema = z.object({
	employee: clinicEmployeeSchema,
});

export const clinicEmployeeMessageResponseSchema = z.object({
	message: z.string(),
});

export type ClinicEmployeeParamsSchema = z.infer<typeof clinicEmployeeParamsSchema>;
export type ClinicEmployeeUserParamsSchema = z.infer<
	typeof clinicEmployeeUserParamsSchema
>;
export type UpsertClinicEmployeeBodySchema = z.infer<
	typeof upsertClinicEmployeeBodySchema
>;
export type UpdateClinicEmployeeBodySchema = z.infer<
	typeof updateClinicEmployeeBodySchema
>;

export const getClinicEmployeesRouteOptions = {
	schema: {
		tags: ["Clinics"],
		summary: "Get clinic employees",
		security: [{ bearerAuth: [] }],
		params: clinicEmployeeParamsSchema,
		response: {
			200: clinicEmployeesResponseSchema,
		},
	},
};

export const upsertClinicEmployeeRouteOptions = {
	schema: {
		tags: ["Clinics"],
		summary: "Add or update a clinic employee",
		security: [{ bearerAuth: [] }],
		params: clinicEmployeeParamsSchema,
		body: upsertClinicEmployeeBodySchema,
		response: {
			200: clinicEmployeeResponseSchema,
		},
	},
};

export const updateClinicEmployeeRouteOptions = {
	schema: {
		tags: ["Clinics"],
		summary: "Update a clinic employee",
		security: [{ bearerAuth: [] }],
		params: clinicEmployeeUserParamsSchema,
		body: updateClinicEmployeeBodySchema,
		response: {
			200: clinicEmployeeResponseSchema,
		},
	},
};

export const deleteClinicEmployeeRouteOptions = {
	schema: {
		tags: ["Clinics"],
		summary: "Remove a clinic employee",
		security: [{ bearerAuth: [] }],
		params: clinicEmployeeUserParamsSchema,
		response: {
			200: clinicEmployeeMessageResponseSchema,
		},
	},
};
