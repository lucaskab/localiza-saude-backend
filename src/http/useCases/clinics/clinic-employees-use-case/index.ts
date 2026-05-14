import { prisma } from "@/database/prisma";
import {
	CLINIC_PROVIDER_PERMISSIONS,
	CLINIC_STAFF_DEFAULT_PERMISSIONS,
	clinicRbac,
} from "@/http/services/clinic-rbac";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import type {
	ClinicEmployeeRole,
	ClinicPermission,
	user,
} from "../../../../../prisma/generated/prisma/client";
import type {
	UpdateClinicEmployeeBodySchema,
	UpsertClinicEmployeeBodySchema,
} from "@/schemas/routes/clinics/clinic-employees";

function getDefaultPermissions(role: Exclude<ClinicEmployeeRole, "OWNER">) {
	return role === "PROVIDER"
		? CLINIC_PROVIDER_PERMISSIONS
		: CLINIC_STAFF_DEFAULT_PERMISSIONS;
}

function normalizePermissions({
	role,
	permissions,
}: {
	role: Exclude<ClinicEmployeeRole, "OWNER">;
	permissions?: ClinicPermission[];
}) {
	return permissions ?? getDefaultPermissions(role);
}

async function assertClinicExists(clinicId: string) {
	const clinic = await prisma.clinic.findUnique({
		where: { id: clinicId },
	});

	if (!clinic) {
		throw new BadRequestError("Clinic not found");
	}

	return clinic;
}

export const clinicEmployeesUseCase = {
	async list(currentUser: user, clinicId: string) {
		await assertClinicExists(clinicId);
		await clinicRbac.assertCanManageClinic(
			currentUser,
			clinicId,
			"MANAGE_STAFF",
		);

		const employees = await prisma.clinic_employee.findMany({
			where: { clinicId },
			include: { user: true },
			orderBy: [{ active: "desc" }, { role: "asc" }, { createdAt: "asc" }],
		});

		return { employees };
	},

	async upsert(
		currentUser: user,
		clinicId: string,
		data: UpsertClinicEmployeeBodySchema,
	) {
		await assertClinicExists(clinicId);
		await clinicRbac.assertCanManageClinic(
			currentUser,
			clinicId,
			"MANAGE_STAFF",
		);

		const employeeUser = await prisma.user.findUnique({
			where: {
				email: data.userEmail.toLowerCase(),
			},
		});

		if (!employeeUser) {
			throw new BadRequestError("User not found");
		}

		if (employeeUser.role === "ADMIN") {
			throw new BadRequestError("Admin users cannot be clinic employees");
		}

		const role = data.role;
		const permissions = normalizePermissions({
			role,
			permissions: data.permissions,
		});

		const employee = await prisma.$transaction(async (tx) => {
			if (role === "STAFF" && employeeUser.role === "CUSTOMER") {
				await tx.user.update({
					where: { id: employeeUser.id },
					data: { role: "STAFF" },
				});
			}

			return tx.clinic_employee.upsert({
				where: {
					clinicId_userId: {
						clinicId,
						userId: employeeUser.id,
					},
				},
				update: {
					role,
					permissions,
					active: true,
				},
				create: {
					clinicId,
					userId: employeeUser.id,
					role,
					permissions,
					active: true,
				},
				include: { user: true },
			});
		});

		return { employee };
	},

	async update(
		currentUser: user,
		clinicId: string,
		userId: string,
		data: UpdateClinicEmployeeBodySchema,
	) {
		await assertClinicExists(clinicId);
		await clinicRbac.assertCanManageClinic(
			currentUser,
			clinicId,
			"MANAGE_STAFF",
		);

		const existingEmployee = await prisma.clinic_employee.findUnique({
			where: {
				clinicId_userId: {
					clinicId,
					userId,
				},
			},
		});

		if (!existingEmployee) {
			throw new BadRequestError("Clinic employee not found");
		}

		if (existingEmployee.role === "OWNER") {
			throw new BadRequestError("Clinic owner employee cannot be changed");
		}

		const role = data.role ?? existingEmployee.role;
		const employee = await prisma.clinic_employee.update({
			where: {
				clinicId_userId: {
					clinicId,
					userId,
				},
			},
			data: {
				...(data.role !== undefined && { role }),
				...(data.permissions !== undefined && {
					permissions: data.permissions,
				}),
				...(data.active !== undefined && { active: data.active }),
			},
			include: { user: true },
		});

		return { employee };
	},

	async remove(currentUser: user, clinicId: string, userId: string) {
		await assertClinicExists(clinicId);
		await clinicRbac.assertCanManageClinic(
			currentUser,
			clinicId,
			"MANAGE_STAFF",
		);

		const existingEmployee = await prisma.clinic_employee.findUnique({
			where: {
				clinicId_userId: {
					clinicId,
					userId,
				},
			},
		});

		if (!existingEmployee) {
			throw new BadRequestError("Clinic employee not found");
		}

		if (existingEmployee.role === "OWNER") {
			throw new BadRequestError("Clinic owner employee cannot be removed");
		}

		await prisma.clinic_employee.update({
			where: {
				clinicId_userId: {
					clinicId,
					userId,
				},
			},
			data: {
				active: false,
			},
		});

		return { message: "Clinic employee removed successfully" };
	},
};
