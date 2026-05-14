import { beforeEach, describe, expect, mock, test } from "bun:test";

const mockPrisma: any = {
	clinic: {
		findUnique: mock(() => Promise.resolve({ id: "clinic-1" })),
	},
	user: {
		findUnique: mock(() =>
			Promise.resolve({
				id: "user-1",
				email: "staff@example.com",
				role: "CUSTOMER",
			}),
		),
	},
	clinic_employee: {
		findMany: mock(() => Promise.resolve([{ id: "employee-1" }])),
		findUnique: mock(() =>
			Promise.resolve({
				clinicId: "clinic-1",
				userId: "user-1",
				role: "STAFF",
			}),
		),
		update: mock(() => Promise.resolve({ id: "employee-1", active: false })),
	},
	$transaction: mock(async (callback: (tx: any) => Promise<any>) =>
		callback({
			user: {
				update: mock(() => Promise.resolve(undefined)),
			},
			clinic_employee: {
				upsert: mock(() =>
					Promise.resolve({
						id: "employee-1",
						role: "STAFF",
						active: true,
					}),
				),
			},
		}),
	),
};

const mockClinicRbac = {
	assertCanManageClinic: mock(() => Promise.resolve(undefined)),
};

mock.module("@/database/prisma", () => ({
	prisma: mockPrisma,
}));

mock.module("@/http/services/clinic-rbac", () => ({
	CLINIC_PROVIDER_PERMISSIONS: [
		"MANAGE_PROVIDER_PROFILE",
		"MANAGE_PROVIDER_SCHEDULE",
		"MANAGE_APPOINTMENTS",
		"MANAGE_PROCEDURES",
		"VIEW_PATIENTS",
	],
	CLINIC_STAFF_DEFAULT_PERMISSIONS: [
		"MANAGE_PROVIDER_PROFILE",
		"MANAGE_PROVIDER_SCHEDULE",
		"MANAGE_APPOINTMENTS",
		"VIEW_PATIENTS",
	],
	clinicRbac: mockClinicRbac,
}));

const { clinicEmployeesUseCase } = await import("./index");

describe("clinicEmployeesUseCase", () => {
	beforeEach(() => {
		mockPrisma.clinic.findUnique.mockReset();
		mockPrisma.user.findUnique.mockReset();
		mockPrisma.clinic_employee.findMany.mockReset();
		mockPrisma.clinic_employee.findUnique.mockReset();
		mockPrisma.clinic_employee.update.mockReset();
		mockPrisma.$transaction.mockReset();
		mockClinicRbac.assertCanManageClinic.mockReset();

		mockPrisma.clinic.findUnique.mockResolvedValue({ id: "clinic-1" });
		mockPrisma.user.findUnique.mockResolvedValue({
			id: "user-1",
			email: "staff@example.com",
			role: "CUSTOMER",
		});
		mockPrisma.clinic_employee.findMany.mockResolvedValue([
			{
				id: "employee-1",
				user: {
					id: "user-1",
				},
			},
		]);
		mockPrisma.clinic_employee.findUnique.mockResolvedValue({
			clinicId: "clinic-1",
			userId: "user-1",
			role: "STAFF",
		});
		mockPrisma.clinic_employee.update.mockResolvedValue({
			id: "employee-1",
			active: false,
		});
		mockPrisma.$transaction.mockImplementation(
			async (callback: (tx: any) => Promise<any>) =>
				callback({
					user: {
						update: mock(() => Promise.resolve(undefined)),
					},
					clinic_employee: {
						upsert: mock(() =>
							Promise.resolve({
								id: "employee-1",
								role: "STAFF",
								active: true,
							}),
						),
					},
				}),
		);
		mockClinicRbac.assertCanManageClinic.mockResolvedValue(undefined);
	});

	test("lists employees after permission check", async () => {
		const result = await clinicEmployeesUseCase.list(
			{ id: "owner-1", role: "HEALTHCARE_PROVIDER" } as any,
			"clinic-1",
		);

		expect(mockClinicRbac.assertCanManageClinic).toHaveBeenCalledWith(
			{ id: "owner-1", role: "HEALTHCARE_PROVIDER" },
			"clinic-1",
			"MANAGE_STAFF",
		);
		expect(result.employees).toEqual([
			expect.objectContaining({
				id: "employee-1",
				user: expect.objectContaining({
					id: "user-1",
				}),
			}),
		]);
	});

	test("upserts clinic employee and promotes customer to staff", async () => {
		const result = await clinicEmployeesUseCase.upsert(
			{ id: "owner-1", role: "HEALTHCARE_PROVIDER" } as any,
			"clinic-1",
			{
				userEmail: "Staff@Example.com",
				role: "STAFF",
			} as any,
		);

		expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
			where: { email: "staff@example.com" },
		});
		expect(result.employee.role).toBe("STAFF");
	});

	test("removes clinic employee by deactivating them", async () => {
		const result = await clinicEmployeesUseCase.remove(
			{ id: "owner-1", role: "HEALTHCARE_PROVIDER" } as any,
			"clinic-1",
			"user-1",
		);

		expect(mockPrisma.clinic_employee.update).toHaveBeenCalledWith({
			where: {
				clinicId_userId: {
					clinicId: "clinic-1",
					userId: "user-1",
				},
			},
			data: {
				active: false,
			},
		});
		expect(result.message).toBe("Clinic employee removed successfully");
	});

	test("rejects removing the owner employee", async () => {
		mockPrisma.clinic_employee.findUnique.mockResolvedValue({
			clinicId: "clinic-1",
			userId: "owner-1",
			role: "OWNER",
		});

		await expect(
			clinicEmployeesUseCase.remove(
				{ id: "owner-1", role: "HEALTHCARE_PROVIDER" } as any,
				"clinic-1",
				"owner-1",
			),
		).rejects.toThrow("Clinic owner employee cannot be removed");
	});
});
