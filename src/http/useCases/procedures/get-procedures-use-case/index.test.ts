import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { ProcedureWithChecklist } from "@/http/repositories/procedures/procedures-repository-contract";

const makeProcedure = (): ProcedureWithChecklist => ({
	id: "procedure-1",
	name: "Consulta",
	description: null,
	priceInCents: 10000,
	durationInMinutes: 60,
	healthcareProviderId: "provider-1",
	createdAt: new Date("2026-08-01T10:00:00.000Z"),
	updatedAt: new Date("2026-08-01T10:00:00.000Z"),
	checklistItems: [],
});

const mockProcedureRepository = {
	findAll: mock((): Promise<ProcedureWithChecklist[]> => Promise.resolve([])),
};

mock.module(
	"@/http/repositories/procedures/procedures-repository-implementation",
	() => ({
		prismaProcedureRepository: mockProcedureRepository,
	}),
);

const { getProceduresUseCase } = await import("./index");

describe("getProceduresUseCase", () => {
	beforeEach(() => {
		mockProcedureRepository.findAll.mockReset();
		mockProcedureRepository.findAll.mockResolvedValue([]);
	});

	test("returns all procedures", async () => {
		mockProcedureRepository.findAll.mockResolvedValue([makeProcedure()]);

		const result = await getProceduresUseCase.execute();

		expect(mockProcedureRepository.findAll).toHaveBeenCalledTimes(1);
		expect(result.procedures).toHaveLength(1);
		expect(result.procedures[0]?.name).toBe("Consulta");
	});
});
