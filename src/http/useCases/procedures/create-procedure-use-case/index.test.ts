import { beforeEach, describe, expect, mock, test } from "bun:test";
import type {
	CreateProcedureData,
	ProcedureWithChecklist,
} from "@/http/repositories/procedures/procedures-repository-contract";
import { makeUser } from "@/http/tests/factories";

const mockClinicRbac = {
	assertCanManageProvider: mock(() => Promise.resolve(undefined)),
};

const makeProcedure = (data: CreateProcedureData): ProcedureWithChecklist => ({
	id: "procedure-1",
	name: data.name,
	description: data.description ?? null,
	priceInCents: data.priceInCents,
	durationInMinutes: data.durationInMinutes,
	healthcareProviderId: data.healthcareProviderId,
	createdAt: new Date(),
	updatedAt: new Date(),
	checklistItems: [],
});

const mockProcedureRepository = {
	create: mock((data: CreateProcedureData): Promise<ProcedureWithChecklist> =>
		Promise.resolve(makeProcedure(data)),
	),
};

mock.module("@/http/services/clinic-rbac", () => ({
	clinicRbac: mockClinicRbac,
}));

mock.module("@/http/repositories/procedures/procedures-repository-implementation", () => ({
	prismaProcedureRepository: mockProcedureRepository,
}));

const { createProcedureUseCase } = await import("./index");

describe("createProcedureUseCase", () => {
	beforeEach(() => {
		mockClinicRbac.assertCanManageProvider.mockReset();
		mockProcedureRepository.create.mockReset();
		mockClinicRbac.assertCanManageProvider.mockResolvedValue(undefined);
		mockProcedureRepository.create.mockImplementation(
			(data: CreateProcedureData): Promise<ProcedureWithChecklist> =>
				Promise.resolve(makeProcedure(data)),
		);
	});

	test("checks provider permission before creating procedure", async () => {
		const actor = makeUser({
			id: "provider-1",
			role: "HEALTHCARE_PROVIDER",
		});

		const result = await createProcedureUseCase.execute(
			actor,
			{
				healthcareProviderId: "provider-1",
				name: "Consulta inicial",
				priceInCents: 10000,
				durationInMinutes: 60,
			},
		);

		expect(mockClinicRbac.assertCanManageProvider).toHaveBeenCalledWith(
			actor,
			"provider-1",
			"MANAGE_PROCEDURES",
		);
		expect(mockProcedureRepository.create).toHaveBeenCalled();
		expect(result.procedure.id).toBe("procedure-1");
	});
});
