import { prisma } from "@/database/prisma";
import type {
	CreateCustomerData,
	CustomerRepository,
	UpdateCustomerData,
} from "./customers-repository-contract";

export const prismaCustomerRepository: CustomerRepository = {
	async findAll() {
		const customers = await prisma.customer.findMany({
			orderBy: {
				createdAt: "desc",
			},
		});

		return customers;
	},

	async findById(id: string) {
		const customer = await prisma.customer.findUnique({
			where: { id },
		});

		return customer;
	},

	async findByUserId(userId: string) {
		const customer = await prisma.customer.findUnique({
			where: { userId },
		});

		return customer;
	},

	async create(data: CreateCustomerData) {
		const customer = await prisma.customer.create({
			data: {
				userId: data.userId,
				cpf: data.cpf,
				dateOfBirth: data.dateOfBirth,
				address: data.address,
			},
		});

		return customer;
	},

	async update(id: string, data: UpdateCustomerData) {
		const customer = await prisma.customer.update({
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
		await prisma.customer.delete({
			where: { id },
		});
	},
};
