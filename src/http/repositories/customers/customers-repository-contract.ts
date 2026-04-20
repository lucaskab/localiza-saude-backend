import type { customer } from "../../../../prisma/generated/prisma/client";

export type CreateCustomerData = {
	userId: string;
	cpf?: string | null;
	dateOfBirth?: Date | null;
	address?: string | null;
};

export type UpdateCustomerData = {
	cpf?: string | null;
	dateOfBirth?: Date | null;
	address?: string | null;
};

export type CustomerRepository = {
	findAll: () => Promise<customer[]>;
	findById: (id: string) => Promise<customer | null>;
	findByUserId: (userId: string) => Promise<customer | null>;
	create: (data: CreateCustomerData) => Promise<customer>;
	update: (id: string, data: UpdateCustomerData) => Promise<customer>;
	delete: (id: string) => Promise<void>;
};
