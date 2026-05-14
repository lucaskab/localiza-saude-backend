import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { ProcedureWithChecklist } from "@/http/repositories/procedures/procedures-repository-contract";

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
};

mock.module(
	"@/http/repositories/procedures/procedures-repository-implementation",
	() => ({
		prismaProcedureRepository: mockProcedureRepository,
	}),
);

const { getProcedureByIdUseCase } = await import("./index");

describe("getProcedureByIdUseCase", () => {
	beforeEach(() => {
		mockProcedureRepository.findById.mockReset();
		mockProcedureRepository.findById.mockResolvedValue(makeProcedure());
	});

	test("returns procedure by id", async () => {
		const result = await getProcedureByIdUseCase.execute("procedure-1");

		expect(mockProcedureRepository.findById).toHaveBeenCalledWith("procedure-1");
		expect(result.procedure.name).toBe("Consulta");
	});

	test("throws when procedure is missing", async () => {
		mockProcedureRepository.findById.mockResolvedValue(null);

		await expect(getProcedureByIdUseCase.execute("missing")).rejects.toThrow(
			"Procedure not found",
		);
	});
});
