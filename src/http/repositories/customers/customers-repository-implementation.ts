import { prisma } from "@/database/prisma";
import type {
	CreateCustomerData,
	CustomerRepository,
	UpdateCustomerData,
} from "./customers-repository-contract";

export const prismaCustomerRepository: CustomerRepository = {
	async findAll() {
		const customers = await prisma.user.findMany({
			where: { role: "CUSTOMER" },
			orderBy: {
				createdAt: "desc",
			},
		});

		return customers;
	},

	async findById(id: string) {
		const customer = await prisma.user.findUnique({
			where: { id, role: "CUSTOMER" },
		});

		return customer;
	},

	async findByUserId(userId: string) {
		const customer = await prisma.user.findUnique({
			where: { id: userId, role: "CUSTOMER" },
		});

		return customer;
	},

	async create(data: CreateCustomerData) {
		const customer = await prisma.user.update({
			where: { id: data.userId },
			data: {
				role: "CUSTOMER",
				cpf: data.cpf,
				dateOfBirth: data.dateOfBirth,
				address: data.address,
			},
		});

		return customer;
	},

	async update(id: string, data: UpdateCustomerData) {
		const customer = await prisma.user.update({
			where: { id },
			data: {
				...(data.cpf !== undefined && { cpf: data.cpf }),
				...(data.dateOfBirth !== undefined && {
					dateOfBirth: data.dateOfBirth,
				}),
				...(data.address !== undefined && { address: data.address }),
			},
		});

		return customer;
	},

	async delete(id: string) {
		await prisma.user.delete({
			where: { id },
		});
	},
};
