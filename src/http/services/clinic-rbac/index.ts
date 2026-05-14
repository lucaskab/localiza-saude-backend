import { prisma } from "@/database/prisma";
import { UnauthorizedError } from "@/http/routes/_errors/unauthorized-error";
import type {
	ClinicPermission,
	clinic_employee,
	user,
} from "../../../../prisma/generated/prisma/client";

export const CLINIC_OWNER_PERMISSIONS: ClinicPermission[] = [
	"MANAGE_PROVIDER_PROFILE",
	"MANAGE_PROVIDER_SCHEDULE",
	"MANAGE_APPOINTMENTS",
	"MANAGE_PROCEDURES",
	"VIEW_PATIENTS",
	"MANAGE_CLINIC_INFO",
	"MANAGE_STAFF",
];

export const CLINIC_PROVIDER_PERMISSIONS: ClinicPermission[] = [
	"MANAGE_PROVIDER_PROFILE",
	"MANAGE_PROVIDER_SCHEDULE",
	"MANAGE_APPOINTMENTS",
	"MANAGE_PROCEDURES",
	"VIEW_PATIENTS",
];

export const CLINIC_STAFF_DEFAULT_PERMISSIONS: ClinicPermission[] = [
	"MANAGE_PROVIDER_PROFILE",
	"MANAGE_PROVIDER_SCHEDULE",
	"MANAGE_APPOINTMENTS",
	"VIEW_PATIENTS",
];

function hasPermission(
	employee: Pick<clinic_employee, "role" | "permissions" | "active">,
	permission: ClinicPermission,
) {
	if (!employee.active) {
		return false;
	}

	return (
		employee.role === "OWNER" || employee.permissions.includes(permission)
	);
}

async function getProviderClinicEmployees(providerId: string) {
	return prisma.clinic_employee.findMany({
		where: {
			userId: providerId,
			active: true,
			role: {
				in: ["OWNER", "PROVIDER"],
			},
		},
	});
}

export const clinicRbac = {
	async canManageClinic(
		actor: user,
		clinicId: string,
		permission: ClinicPermission,
	) {
		if (actor.role === "ADMIN") {
			return true;
		}

		const employee = await prisma.clinic_employee.findUnique({
			where: {
				clinicId_userId: {
					clinicId,
					userId: actor.id,
				},
			},
		});

		return employee ? hasPermission(employee, permission) : false;
	},

	async assertCanManageClinic(
		actor: user,
		clinicId: string,
		permission: ClinicPermission,
	) {
		const canManage = await this.canManageClinic(actor, clinicId, permission);

		if (!canManage) {
			throw new UnauthorizedError("You cannot manage this clinic");
		}
	},

	async canManageProvider(
		actor: user,
		providerId: string,
		permission: ClinicPermission,
	) {
		if (actor.role === "ADMIN") {
			return true;
		}

		if (actor.id === providerId && actor.role === "HEALTHCARE_PROVIDER") {
			return true;
		}

		if (actor.role !== "STAFF" && actor.role !== "HEALTHCARE_PROVIDER") {
			return false;
		}

		const providerEmployees = await getProviderClinicEmployees(providerId);

		if (providerEmployees.length === 0) {
			return false;
		}

		const actorEmployees = await prisma.clinic_employee.findMany({
			where: {
				userId: actor.id,
				active: true,
				clinicId: {
					in: providerEmployees.map((employee) => employee.clinicId),
				},
			},
		});

		return actorEmployees.some((employee) =>
			hasPermission(employee, permission),
		);
	},

	async assertCanManageProvider(
		actor: user,
		providerId: string,
		permission: ClinicPermission,
	) {
		const canManage = await this.canManageProvider(
			actor,
			providerId,
			permission,
		);

		if (!canManage) {
			throw new UnauthorizedError("You cannot manage this provider");
		}
	},

	async assertCanCreateAppointmentForProvider(actor: user, providerId: string) {
		await this.assertCanManageProvider(
			actor,
			providerId,
			"MANAGE_APPOINTMENTS",
		);
	},
};
