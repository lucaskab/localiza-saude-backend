import type { user } from "../../../../prisma/generated/prisma/client";

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
	findAll: () => Promise<user[]>;
	findById: (id: string) => Promise<user | null>;
	findByUserId: (userId: string) => Promise<user | null>;
	create: (data: CreateCustomerData) => Promise<user>;
	update: (id: string, data: UpdateCustomerData) => Promise<user>;
	delete: (id: string) => Promise<void>;
};
