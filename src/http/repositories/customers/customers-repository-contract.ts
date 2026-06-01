import type { user } from "../../../../prisma/generated/prisma/client";
import type { AddressInputSchema } from "@/schemas/routes/addresses/address";

export type CreateCustomerData = {
	userId: string;
	cpf?: string | null;
	dateOfBirth?: Date | null;
};

export type UpdateCustomerData = {
	name?: string;
	phone?: string | null;
	cpf?: string | null;
	dateOfBirth?: Date | null;
	address?: AddressInputSchema;
	healthInsurancePlanIds?: string[];
};

export type CustomerRepository = {
	findAll: () => Promise<user[]>;
	findById: (id: string) => Promise<user | null>;
	findByUserId: (userId: string) => Promise<user | null>;
	create: (data: CreateCustomerData) => Promise<user>;
	update: (id: string, data: UpdateCustomerData) => Promise<user>;
	delete: (id: string) => Promise<void>;
};
