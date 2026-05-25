import { beforeEach, describe, expect, mock, test } from "bun:test";

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

const mockUpsertPrimaryAddressUseCase = {
	execute: mock(() => Promise.resolve(null)),
};

const mockAttachPrimaryAddressToOwner = mock((_: "CLINIC", clinic: any) =>
	Promise.resolve({
		...clinic,
		primaryAddress: {
			id: "address-1",
			ownerType: "CLINIC",
			ownerId: clinic.id,
			type: "CLINIC",
			isPrimary: true,
			label: null,
			countryCode: "BR",
			postalCode: "01001-000",
			state: "SP",
			city: "Sao Paulo",
			neighborhood: "Centro",
			street: "Rua A",
			number: "123",
			complement: null,
			reference: null,
			latitude: -23.5505,
			longitude: -46.6333,
			formattedAddress: "Rua A, 123, Centro, Sao Paulo - SP, 01001-000, Brasil",
			createdAt: new Date(),
			updatedAt: new Date(),
		},
	}),
);

mock.module("@/database/prisma", () => ({
	prisma: mockPrisma,
}));

mock.module("@/http/useCases/addresses/upsert-primary-address-use-case", () => ({
	upsertPrimaryAddressUseCase: mockUpsertPrimaryAddressUseCase,
}));

mock.module("@/http/useCases/addresses/attach-primary-addresses", () => ({
	attachPrimaryAddressToOwner: mockAttachPrimaryAddressToOwner,
}));

const { createClinicUseCase } = await import("./index");

describe("createClinicUseCase", () => {
	beforeEach(() => {
		mockPrisma.$transaction.mockClear();
		mockPrisma.lastCreateData = null;
		mockUpsertPrimaryAddressUseCase.execute.mockReset();
		mockAttachPrimaryAddressToOwner.mockClear();
		mockUpsertPrimaryAddressUseCase.execute.mockResolvedValue(null);
	});

	test("creates clinic with primary address and owner employee", async () => {
		const result = await createClinicUseCase.execute(
			{ id: "owner-1", role: "HEALTHCARE_PROVIDER" } as any,
			{
				name: "Clínica Centro",
				phone: "11999999999",
				description: "Atendimento geral",
				email: "clinic@example.com",
				type: "PRIVATE",
				address: {
					postalCode: "01001-000",
					state: "SP",
					city: "Sao Paulo",
					neighborhood: "Centro",
					street: "Rua A",
					number: "123",
				},
			} as any,
		);

		expect(mockUpsertPrimaryAddressUseCase.execute).toHaveBeenCalledWith(
			"CLINIC",
			"clinic-1",
			expect.objectContaining({
				type: "CLINIC",
				street: "Rua A",
				number: "123",
			}),
		);
		expect(result.clinic.ownerId).toBe("owner-1");
		expect(result.clinic.primaryAddress?.latitude).toBe(-23.5505);
		expect(result.clinic.primaryAddress?.longitude).toBe(-46.6333);
		expect(mockPrisma.lastCreateData.employees.create).toMatchObject({
			userId: "owner-1",
			role: "OWNER",
			active: true,
		});
	});
});
