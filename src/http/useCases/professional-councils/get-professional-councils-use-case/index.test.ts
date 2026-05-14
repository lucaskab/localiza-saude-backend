import { beforeEach, describe, expect, mock, test } from "bun:test";

const mockPrisma = {
	professional_council: {
		findMany: mock(() =>
			Promise.resolve([
				{
					id: "council-1",
					acronym: "CRM",
					name: "Conselho Regional de Medicina",
					profession: "Medicina",
					active: true,
					allowsPriceVisibility: false,
					createdAt: new Date("2026-08-01T10:00:00.000Z"),
					updatedAt: new Date("2026-08-01T10:00:00.000Z"),
				},
			]),
		),
	},
};

mock.module("@/database/prisma", () => ({
	prisma: mockPrisma,
}));

const { getProfessionalCouncilsUseCase } = await import("./index");

describe("getProfessionalCouncilsUseCase", () => {
	beforeEach(() => {
		mockPrisma.professional_council.findMany.mockReset();
		mockPrisma.professional_council.findMany.mockResolvedValue([
			{
				id: "council-1",
				acronym: "CRM",
				name: "Conselho Regional de Medicina",
				profession: "Medicina",
				active: true,
				allowsPriceVisibility: false,
				createdAt: new Date("2026-08-01T10:00:00.000Z"),
				updatedAt: new Date("2026-08-01T10:00:00.000Z"),
			},
		]);
	});

	test("returns only active councils ordered by profession and acronym", async () => {
		const result = await getProfessionalCouncilsUseCase.execute();

		expect(mockPrisma.professional_council.findMany).toHaveBeenCalledWith({
			where: {
				active: true,
			},
			orderBy: [{ profession: "asc" }, { acronym: "asc" }],
		});
		expect(result.professionalCouncils[0]?.acronym).toBe("CRM");
	});
});
