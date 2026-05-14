import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { clinic_employee } from "../../../../prisma/generated/prisma/client";
import { makeUser } from "@/http/tests/factories";

type ClinicEmployeeSelection = Pick<
	clinic_employee,
	"clinicId" | "userId" | "role" | "permissions" | "active"
>;

const mockPrisma = {
	clinic_employee: {
		findUnique: mock(
			(): Promise<ClinicEmployeeSelection | null> => Promise.resolve(null),
		),
		findMany: mock(
			(): Promise<ClinicEmployeeSelection[]> => Promise.resolve([]),
		),
	},
};

mock.module("@/database/prisma", () => ({
	prisma: mockPrisma,
}));

const { clinicRbac } = await import("./index");

describe("clinicRbac", () => {
	beforeEach(() => {
		mockPrisma.clinic_employee.findUnique.mockReset();
		mockPrisma.clinic_employee.findMany.mockReset();
		mockPrisma.clinic_employee.findUnique.mockResolvedValue(null);
		mockPrisma.clinic_employee.findMany.mockResolvedValue([]);
	});

	test("allows admins to manage any clinic", async () => {
		const result = await clinicRbac.canManageClinic(
			makeUser({ id: "admin-1", role: "ADMIN" }),
			"clinic-1",
			"MANAGE_CLINIC_INFO",
		);

		expect(result).toBe(true);
	});

	test("returns false when clinic employee is inactive", async () => {
		mockPrisma.clinic_employee.findUnique.mockResolvedValue({
			clinicId: "clinic-1",
			userId: "staff-1",
			role: "STAFF",
			permissions: ["MANAGE_CLINIC_INFO"],
			active: false,
		});

		const result = await clinicRbac.canManageClinic(
			makeUser({ id: "staff-1", role: "STAFF" }),
			"clinic-1",
			"MANAGE_CLINIC_INFO",
		);

		expect(result).toBe(false);
	});

	test("allows provider to manage their own profile", async () => {
		const result = await clinicRbac.canManageProvider(
			makeUser({ id: "provider-1", role: "HEALTHCARE_PROVIDER" }),
			"provider-1",
			"MANAGE_PROVIDER_PROFILE",
		);

		expect(result).toBe(true);
	});

	test("allows staff from the same clinic with permission to manage provider", async () => {
		mockPrisma.clinic_employee.findMany
			.mockResolvedValueOnce([
				{
					clinicId: "clinic-1",
					userId: "provider-2",
					role: "PROVIDER",
					permissions: [],
					active: true,
				},
			])
			.mockResolvedValueOnce([
				{
					clinicId: "clinic-1",
					userId: "staff-1",
					role: "STAFF",
					permissions: ["MANAGE_APPOINTMENTS"],
					active: true,
				},
			]);

		const result = await clinicRbac.canManageProvider(
			makeUser({ id: "staff-1", role: "STAFF" }),
			"provider-2",
			"MANAGE_APPOINTMENTS",
		);

		expect(result).toBe(true);
	});

	test("assertCanManageProvider throws when actor has no permission", async () => {
		await expect(
			clinicRbac.assertCanManageProvider(
				makeUser({ id: "staff-2", role: "STAFF" }),
				"provider-2",
				"MANAGE_APPOINTMENTS",
			),
		).rejects.toThrow("You cannot manage this provider");
	});
});
