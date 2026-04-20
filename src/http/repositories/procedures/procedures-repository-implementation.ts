import { prisma } from "@/database/prisma";
import type {
	CreateProcedureData,
	ProcedureRepository,
	UpdateProcedureData,
} from "./procedures-repository-contract";

export const prismaProcedureRepository: ProcedureRepository = {
	async findAll() {
		const procedures = await prisma.procedure.findMany({
			orderBy: {
				createdAt: "desc",
			},
		});

		return procedures;
	},

	async findById(id: string) {
		const procedure = await prisma.procedure.findUnique({
			where: { id },
		});

		return procedure;
	},

	async findByHealthcareProviderId(healthcareProviderId: string) {
		const procedures = await prisma.procedure.findMany({
			where: {
				healthcareProviderId,
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
			},
		});

		return procedure;
	},

	async update(id: string, data: UpdateProcedureData) {
		const procedure = await prisma.procedure.update({
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
			},
		});

		return procedure;
	},

	async delete(id: string) {
		await prisma.procedure.delete({
			where: { id },
		});
	},
};
