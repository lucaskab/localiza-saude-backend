import { beforeEach, describe, expect, mock, test } from "bun:test";

const mockClinicRepository: any = {
	findById: mock(() =>
		Promise.resolve({
			id: "clinic-1",
		}),
	),
	delete: mock(() => Promise.resolve(undefined)),
};

const mockClinicRbac = {
	assertCanManageClinic: mock(() => Promise.resolve(undefined)),
};

mock.module("@/http/repositories/clinics/clinics-repository-implementation", () => ({
	prismaClinicRepository: mockClinicRepository,
}));

mock.module("@/http/services/clinic-rbac", () => ({
	clinicRbac: mockClinicRbac,
}));

const { deleteClinicUseCase } = await import("./index");

describe("deleteClinicUseCase", () => {
	beforeEach(() => {
		mockClinicRepository.findById.mockReset();
		mockClinicRepository.delete.mockReset();
		mockClinicRbac.assertCanManageClinic.mockReset();
		mockClinicRepository.findById.mockResolvedValue({ id: "clinic-1" });
		mockClinicRepository.delete.mockResolvedValue(undefined);
		mockClinicRbac.assertCanManageClinic.mockResolvedValue(undefined);
	});

	test("deletes clinic after permission check", async () => {
		const result = await deleteClinicUseCase.execute(
			{ id: "owner-1", role: "HEALTHCARE_PROVIDER" } as any,
			"clinic-1",
		);

		expect(mockClinicRbac.assertCanManageClinic).toHaveBeenCalled();
		expect(mockClinicRepository.delete).toHaveBeenCalledWith("clinic-1");
		expect(result.message).toBe("Clinic deleted successfully");
	});

	test("throws when clinic is missing", async () => {
		mockClinicRepository.findById.mockResolvedValue(null);

		await expect(
			deleteClinicUseCase.execute(
				{ id: "owner-1", role: "HEALTHCARE_PROVIDER" } as any,
				"missing",
			),
		).rejects.toThrow("Clinic not found");
	});
});
