import { beforeEach, describe, expect, mock, test } from "bun:test";

const mockGeocodingService = {
	geocode: mock(() =>
		Promise.resolve({
			latitude: -23.5505,
			longitude: -46.6333,
		}),
	),
};

const mockPrisma: any = {
	lastCreateData: null as any,
	$transaction: mock(async (callback: (tx: any) => Promise<unknown>) =>
		callback({
			clinic: {
				create: async ({ data }: any) => {
					mockPrisma.lastCreateData = data;
					return {
					id: "clinic-1",
					...data,
					};
				},
			},
		}),
	),
};

mock.module("@/database/prisma", () => ({
	prisma: mockPrisma,
}));

mock.module("@/http/services/geocoding-service", () => ({
	geocodingService: mockGeocodingService,
}));

const { createClinicUseCase } = await import("./index");

describe("createClinicUseCase", () => {
	beforeEach(() => {
		mockGeocodingService.geocode.mockReset();
		mockPrisma.$transaction.mockClear();
		mockPrisma.lastCreateData = null;
		mockGeocodingService.geocode.mockResolvedValue({
			latitude: -23.5505,
			longitude: -46.6333,
		});
	});

	test("creates clinic using geocoded coordinates and owner employee", async () => {
		const result = await createClinicUseCase.execute(
			{ id: "owner-1", role: "HEALTHCARE_PROVIDER" } as any,
			{
				name: "Clínica Centro",
				phone: "11999999999",
				description: "Atendimento geral",
				email: "clinic@example.com",
				type: "PRIVATE",
				address: "Rua A, 123",
			} as any,
		);

		expect(mockGeocodingService.geocode).toHaveBeenCalledWith("Rua A, 123");
		expect(result.clinic.ownerId).toBe("owner-1");
		expect(result.clinic.latitude).toBe(-23.5505);
		expect(result.clinic.longitude).toBe(-46.6333);
		expect(mockPrisma.lastCreateData.employees.create).toMatchObject({
			userId: "owner-1",
			role: "OWNER",
			active: true,
		});
	});
});
