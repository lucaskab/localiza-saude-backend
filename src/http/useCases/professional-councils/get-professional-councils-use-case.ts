import { prisma } from "@/database/prisma";

export const getProfessionalCouncilsUseCase = {
	async execute() {
		const professionalCouncils = await prisma.professional_council.findMany({
			where: {
				active: true,
			},
			orderBy: [
				{
					profession: "asc",
				},
				{
					acronym: "asc",
				},
			],
		});

		return { professionalCouncils };
	},
};
