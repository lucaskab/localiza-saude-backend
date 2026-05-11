import { prisma } from "@/database/prisma";
import type {
	CreateProcedureData,
	ProcedureRepository,
	UpdateProcedureData,
} from "./procedures-repository-contract";

const checklistOrderBy = {
	position: "asc" as const,
};

function buildChecklistItems(data?: { text: string; position?: number }[]) {
	return (data ?? [])
		.map((item, index) => ({
			text: item.text.trim(),
			position: item.position ?? index,
		}))
		.filter((item) => item.text.length > 0);
}

export const prismaProcedureRepository: ProcedureRepository = {
	async findAll() {
		const procedures = await prisma.procedure.findMany({
			include: {
				checklistItems: {
					orderBy: checklistOrderBy,
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		return procedures;
	},

	async findById(id: string) {
		const procedure = await prisma.procedure.findUnique({
			where: { id },
			include: {
				checklistItems: {
					orderBy: checklistOrderBy,
				},
			},
		});

		return procedure;
	},

	async findByHealthcareProviderId(healthcareProviderId: string) {
		const procedures = await prisma.procedure.findMany({
			where: {
				healthcareProviderId,
			},
			include: {
				checklistItems: {
					orderBy: checklistOrderBy,
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		return procedures;
	},

	async create(data: CreateProcedureData) {
		const procedure = await prisma.procedure.create({
			data: {
				name: data.name,
				description: data.description,
				priceInCents: data.priceInCents,
				durationInMinutes: data.durationInMinutes,
				healthcareProviderId: data.healthcareProviderId,
				checklistItems: {
					create: buildChecklistItems(data.checklistItems),
				},
			},
			include: {
				checklistItems: {
					orderBy: checklistOrderBy,
				},
			},
		});

		return procedure;
	},

	async update(id: string, data: UpdateProcedureData) {
		const procedure = await prisma.$transaction(async (tx) => {
			if (data.checklistItems !== undefined) {
				await tx.procedure_checklist_item.deleteMany({
					where: { procedureId: id },
				});
			}

			return tx.procedure.update({
				where: { id },
				data: {
					...(data.name && { name: data.name }),
					...(data.description !== undefined && {
						description: data.description,
					}),
					...(data.priceInCents !== undefined && {
						priceInCents: data.priceInCents,
					}),
					...(data.durationInMinutes !== undefined && {
						durationInMinutes: data.durationInMinutes,
					}),
					...(data.checklistItems !== undefined && {
						checklistItems: {
							create: buildChecklistItems(data.checklistItems),
						},
					}),
				},
				include: {
					checklistItems: {
						orderBy: checklistOrderBy,
					},
				},
			});
		});

		return procedure;
	},

	async delete(id: string) {
		await prisma.procedure.delete({
			where: { id },
		});
	},
};
