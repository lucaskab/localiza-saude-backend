import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { ProcedureWithChecklist } from "@/http/repositories/procedures/procedures-repository-contract";
import { makeUser } from "@/http/tests/factories";

const makeProcedure = (): ProcedureWithChecklist => ({
	id: "procedure-1",
	name: "Consulta",
	description: null,
	priceInCents: 10000,
	durationInMinutes: 60,
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
	delete: mock((_: string): Promise<void> => Promise.resolve()),
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

const { deleteProcedureUseCase } = await import("./index");

describe("deleteProcedureUseCase", () => {
	beforeEach(() => {
		mockProcedureRepository.findById.mockReset();
		mockProcedureRepository.delete.mockReset();
		mockClinicRbac.assertCanManageProvider.mockReset();
		mockProcedureRepository.findById.mockResolvedValue(makeProcedure());
		mockProcedureRepository.delete.mockResolvedValue(undefined);
		mockClinicRbac.assertCanManageProvider.mockResolvedValue(undefined);
	});

	test("deletes procedure after permission check", async () => {
		const actor = makeUser({
			id: "provider-1",
			role: "HEALTHCARE_PROVIDER",
		});

		const result = await deleteProcedureUseCase.execute(
			actor,
			"procedure-1",
		);

		expect(mockClinicRbac.assertCanManageProvider).toHaveBeenCalledWith(
			actor,
			"provider-1",
			"MANAGE_PROCEDURES",
		);
		expect(mockProcedureRepository.delete).toHaveBeenCalledWith("procedure-1");
		expect(result.message).toBe("Procedure deleted successfully");
	});

	test("throws when procedure is missing", async () => {
		mockProcedureRepository.findById.mockResolvedValue(null);

		await expect(
			deleteProcedureUseCase.execute(
				makeUser({ id: "provider-1", role: "HEALTHCARE_PROVIDER" }),
				"missing",
			),
		).rejects.toThrow("Procedure not found");
	});
});
