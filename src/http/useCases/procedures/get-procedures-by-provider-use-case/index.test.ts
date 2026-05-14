import { beforeEach, describe, expect, mock, test } from "bun:test";

const mockProcedureRepository = {
	findByHealthcareProviderId: mock(() =>
		Promise.resolve([
			{
				id: "procedure-1",
				name: "Consulta",
			},
		]),
	),
};

mock.module(
	"@/http/repositories/procedures/procedures-repository-implementation",
	() => ({
		prismaProcedureRepository: mockProcedureRepository,
	}),
);

const { getProceduresByProviderUseCase } = await import("./index");

describe("getProceduresByProviderUseCase", () => {
	beforeEach(() => {
		mockProcedureRepository.findByHealthcareProviderId.mockReset();
		mockProcedureRepository.findByHealthcareProviderId.mockResolvedValue([
			{
				id: "procedure-1",
				name: "Consulta",
			},
		]);
	});

	test("returns provider procedures", async () => {
		const result = await getProceduresByProviderUseCase.execute("provider-1");

		expect(
			mockProcedureRepository.findByHealthcareProviderId,
		).toHaveBeenCalledWith("provider-1");
		expect(result.procedures).toHaveLength(1);
	});
});
