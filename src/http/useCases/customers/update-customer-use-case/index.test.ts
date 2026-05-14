import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { UpdateCustomerData } from "@/http/repositories/customers/customers-repository-contract";
import { makeUser } from "@/http/tests/factories";
import type { user } from "../../../../../prisma/generated/prisma/client";

const makeCustomer = (data: UpdateCustomerData = {}): user =>
	makeUser({
		id: "customer-1",
		role: "CUSTOMER",
		cpf: data.cpf ?? "12345678900",
		dateOfBirth: data.dateOfBirth ?? null,
		address: data.address ?? null,
	});

const mockCustomerRepository = {
	findById: mock((_: string): Promise<user | null> => Promise.resolve(makeCustomer())),
	update: mock((id: string, data: UpdateCustomerData): Promise<user> =>
		Promise.resolve({
			...makeCustomer(data),
			id,
		}),
	),
};

mock.module(
	"@/http/repositories/customers/customers-repository-implementation",
	() => ({
		prismaCustomerRepository: mockCustomerRepository,
	}),
);

const { updateCustomerUseCase } = await import("./index");

describe("updateCustomerUseCase", () => {
	beforeEach(() => {
		mockCustomerRepository.findById.mockReset();
		mockCustomerRepository.update.mockReset();
		mockCustomerRepository.findById.mockResolvedValue(makeCustomer());
		mockCustomerRepository.update.mockImplementation(
			(id: string, data: UpdateCustomerData): Promise<user> =>
				Promise.resolve({
					...makeCustomer(data),
					id,
				}),
		);
	});

	test("updates customer when profile exists", async () => {
		const result = await updateCustomerUseCase.execute("customer-1", {
			address: "Rua das Flores, 100",
		});

		expect(mockCustomerRepository.update).toHaveBeenCalledWith("customer-1", {
			address: "Rua das Flores, 100",
		});
		expect(result.customer.address).toBe("Rua das Flores, 100");
	});

	test("throws when customer is missing", async () => {
		mockCustomerRepository.findById.mockResolvedValue(null);

		await expect(
			updateCustomerUseCase.execute("missing", {
				address: "Rua A",
			}),
		).rejects.toThrow("Customer not found");
	});
});
