import { beforeEach, describe, expect, mock, test } from "bun:test";
import type {
	ProcedureWithChecklist,
	UpdateProcedureData,
} from "@/http/repositories/procedures/procedures-repository-contract";
import { makeUser } from "@/http/tests/factories";

const makeProcedure = (
	data: UpdateProcedureData = {},
): ProcedureWithChecklist => ({
	id: "procedure-1",
	name: data.name ?? "Consulta",
	description: data.description ?? null,
	priceInCents: data.priceInCents ?? 10000,
	durationInMinutes: data.durationInMinutes ?? 60,
	healthcareProviderId: "provider-1",
	createdAt: new Date(),
	updatedAt: new Date(),
	checklistItems: [],
});

const mockProcedureRepository = {
	findById: mock(
		(_: string): Promise<ProcedureWithChecklist | null> =>
			Promise.resolve(makeProcedure()),
	),
	update: mock(
		(id: string, data: UpdateProcedureData): Promise<ProcedureWithChecklist> =>
			Promise.resolve({
				...makeProcedure(data),
				id,
			}),
	),
};

const mockClinicRbac = {
	assertCanManageProvider: mock(() => Promise.resolve(undefined)),
};

mock.module(
	"@/http/repositories/procedures/procedures-repository-implementation",
	() => ({
		prismaProcedureRepository: mockProcedureRepository,
	}),
);

mock.module("@/http/services/clinic-rbac", () => ({
	clinicRbac: mockClinicRbac,
}));

const { updateProcedureUseCase } = await import("./index");

describe("updateProcedureUseCase", () => {
	beforeEach(() => {
		mockProcedureRepository.findById.mockReset();
		mockProcedureRepository.update.mockReset();
		mockClinicRbac.assertCanManageProvider.mockReset();
		mockProcedureRepository.findById.mockResolvedValue(makeProcedure());
		mockProcedureRepository.update.mockImplementation(
			(id: string, data: UpdateProcedureData): Promise<ProcedureWithChecklist> =>
				Promise.resolve({
					...makeProcedure(data),
					id,
				}),
		);
		mockClinicRbac.assertCanManageProvider.mockResolvedValue(undefined);
	});

	test("updates procedure after provider permission check", async () => {
		const actor = makeUser({
			id: "provider-1",
			role: "HEALTHCARE_PROVIDER",
		});

		const result = await updateProcedureUseCase.execute(
			actor,
			"procedure-1",
			{
				name: "Consulta de retorno",
			},
		);

		expect(mockClinicRbac.assertCanManageProvider).toHaveBeenCalledWith(
			actor,
			"provider-1",
			"MANAGE_PROCEDURES",
		);
		expect(mockProcedureRepository.update).toHaveBeenCalledWith("procedure-1", {
			name: "Consulta de retorno",
		});
		expect(result.procedure.name).toBe("Consulta de retorno");
	});

	test("throws when procedure does not exist", async () => {
		mockProcedureRepository.findById.mockResolvedValue(null);

		await expect(
			updateProcedureUseCase.execute(
				makeUser({ id: "provider-1", role: "HEALTHCARE_PROVIDER" }),
				"missing",
				{},
			),
		).rejects.toThrow("Procedure not found");
	});
});
