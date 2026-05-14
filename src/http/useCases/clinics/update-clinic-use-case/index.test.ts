import { beforeEach, describe, expect, mock, test } from "bun:test";

const mockClinicRepository: any = {
	findById: mock(() =>
		Promise.resolve({
			id: "clinic-1",
		}),
	),
	update: mock((id: string, data: any) =>
		Promise.resolve({
			id,
			...data,
		}),
	),
};

const mockClinicRbac = {
	assertCanManageClinic: mock(() => Promise.resolve(undefined)),
};

const mockGeocodingService = {
	geocode: mock(() =>
		Promise.resolve({
			latitude: -23.55,
			longitude: -46.63,
		}),
	),
};

mock.module("@/http/repositories/clinics/clinics-repository-implementation", () => ({
	prismaClinicRepository: mockClinicRepository,
}));

mock.module("@/http/services/clinic-rbac", () => ({
	clinicRbac: mockClinicRbac,
}));

mock.module("@/http/services/geocoding-service", () => ({
	geocodingService: mockGeocodingService,
}));

const { updateClinicUseCase } = await import("./index");

describe("updateClinicUseCase", () => {
	beforeEach(() => {
		mockClinicRepository.findById.mockReset();
		mockClinicRepository.update.mockReset();
		mockClinicRbac.assertCanManageClinic.mockReset();
		mockGeocodingService.geocode.mockReset();
		mockClinicRepository.findById.mockResolvedValue({ id: "clinic-1" });
		mockClinicRepository.update.mockImplementation((id: string, data: any) =>
			Promise.resolve({
				id,
				...data,
			}),
		);
		mockClinicRbac.assertCanManageClinic.mockResolvedValue(undefined);
		mockGeocodingService.geocode.mockResolvedValue({
			latitude: -23.55,
			longitude: -46.63,
		});
	});

	test("updates clinic and refreshes coordinates when address changes", async () => {
		const result = await updateClinicUseCase.execute(
			{ id: "staff-1", role: "STAFF" } as any,
			"clinic-1",
			{
				address: "Rua Nova, 123",
				name: "Clínica Nova",
			} as any,
		);

		expect(mockClinicRbac.assertCanManageClinic).toHaveBeenCalledWith(
			{ id: "staff-1", role: "STAFF" },
			"clinic-1",
			"MANAGE_CLINIC_INFO",
		);
		expect(mockGeocodingService.geocode).toHaveBeenCalledWith("Rua Nova, 123");
		expect(mockClinicRepository.update).toHaveBeenCalledWith(
			"clinic-1",
			expect.objectContaining({
				address: "Rua Nova, 123",
				latitude: -23.55,
				longitude: -46.63,
			}),
		);
		expect(result.clinic.name).toBe("Clínica Nova");
	});

	test("throws when clinic is missing", async () => {
		mockClinicRepository.findById.mockResolvedValue(null);

		await expect(
			updateClinicUseCase.execute(
				{ id: "staff-1", role: "STAFF" } as any,
				"missing",
				{} as any,
			),
		).rejects.toThrow("Clinic not found");
	});
});
