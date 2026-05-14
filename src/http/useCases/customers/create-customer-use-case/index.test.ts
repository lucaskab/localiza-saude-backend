import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { CreateCustomerData } from "@/http/repositories/customers/customers-repository-contract";
import { makeUser } from "@/http/tests/factories";
import type { user } from "../../../../../prisma/generated/prisma/client";

const makeCustomer = (data: CreateCustomerData): user =>
	makeUser({
		id: "customer-1",
		role: "CUSTOMER",
		email: "lucas@example.com",
		cpf: data.cpf ?? null,
		dateOfBirth: data.dateOfBirth ?? null,
		address: data.address ?? null,
	});

const mockCustomerRepository = {
	create: mock((data: CreateCustomerData): Promise<user> =>
		Promise.resolve(makeCustomer(data)),
	),
};

mock.module(
	"@/http/repositories/customers/customers-repository-implementation",
	() => ({
		prismaCustomerRepository: mockCustomerRepository,
	}),
);

const { createCustomerUseCase } = await import("./index");

describe("createCustomerUseCase", () => {
	beforeEach(() => {
		mockCustomerRepository.create.mockReset();
		mockCustomerRepository.create.mockImplementation(
			(data: CreateCustomerData): Promise<user> =>
				Promise.resolve(makeCustomer(data)),
		);
	});

	test("creates customer profile", async () => {
		const result = await createCustomerUseCase.execute({
			userId: "customer-1",
			cpf: "12345678900",
		});

		expect(mockCustomerRepository.create).toHaveBeenCalledWith({
			userId: "customer-1",
			cpf: "12345678900",
		});
		expect(result.customer.email).toBe("lucas@example.com");
	});
});
