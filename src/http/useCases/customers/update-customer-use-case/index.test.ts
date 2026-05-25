import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { UpdateCustomerData } from "@/http/repositories/customers/customers-repository-contract";
import { makeUser } from "@/http/tests/factories";
import { UnauthorizedError } from "@/http/routes/_errors/unauthorized-error";
import type { address } from "../../../../../prisma/generated/prisma/client";
import type { user } from "../../../../../prisma/generated/prisma/client";

const makeCustomer = (data: UpdateCustomerData = {}): user =>
	makeUser({
		id: "customer-1",
		role: "CUSTOMER",
		cpf: data.cpf ?? "12345678900",
		dateOfBirth: data.dateOfBirth ?? null,
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

const makeAddress = (): address => ({
	id: "address-1",
	ownerType: "USER",
	ownerId: "customer-1",
	type: "HOME",
	isPrimary: true,
	label: null,
	countryCode: "BR",
	postalCode: "01001-000",
	state: "SP",
	city: "Sao Paulo",
	neighborhood: "Centro",
	street: "Rua Teste",
	number: "123",
	complement: null,
	reference: null,
	latitude: null,
	longitude: null,
	formattedAddress: "Rua Teste, 123, Centro, Sao Paulo - SP, 01001-000, Brasil",
	createdAt: new Date(),
	updatedAt: new Date(),
});

const mockAddressRepository = {
	findPrimaryByOwner: mock(
		(_: "USER" | "CLINIC", __: string): Promise<address | null> =>
			Promise.resolve(makeAddress()),
	),
};

const mockUpsertPrimaryAddressUseCase = {
	execute: mock(
		(
			_: "USER" | "CLINIC",
			__: string,
			___: NonNullable<UpdateCustomerData["address"]>,
		): Promise<address> => Promise.resolve(makeAddress()),
	),
};

mock.module(
	"@/http/repositories/customers/customers-repository-implementation",
	() => ({
		prismaCustomerRepository: mockCustomerRepository,
	}),
);

mock.module(
	"@/http/repositories/addresses/addresses-repository-implementation",
	() => ({
		prismaAddressRepository: mockAddressRepository,
	}),
);

mock.module("@/http/useCases/addresses/upsert-primary-address-use-case", () => ({
	upsertPrimaryAddressUseCase: mockUpsertPrimaryAddressUseCase,
}));

const { updateCustomerUseCase } = await import("./index");

describe("updateCustomerUseCase", () => {
	beforeEach(() => {
		mockCustomerRepository.findById.mockReset();
		mockCustomerRepository.update.mockReset();
		mockAddressRepository.findPrimaryByOwner.mockReset();
		mockUpsertPrimaryAddressUseCase.execute.mockReset();
		mockCustomerRepository.findById.mockResolvedValue(makeCustomer());
		mockCustomerRepository.update.mockImplementation(
			(id: string, data: UpdateCustomerData): Promise<user> =>
				Promise.resolve({
					...makeCustomer(data),
					id,
				}),
		);
		mockAddressRepository.findPrimaryByOwner.mockResolvedValue(makeAddress());
		mockUpsertPrimaryAddressUseCase.execute.mockResolvedValue(makeAddress());
	});

	test("updates customer when profile exists", async () => {
		const result = await updateCustomerUseCase.execute({
			customerId: "customer-1",
			currentUser: makeCustomer(),
			data: {
				cpf: "12345678901",
			},
		});

		expect(mockCustomerRepository.update).toHaveBeenCalledWith("customer-1", {
			cpf: "12345678901",
		});
		expect(result.customer.cpf).toBe("12345678901");
		expect(result.customer.primaryAddress?.id).toBe("address-1");
	});

	test("throws when customer is missing", async () => {
		mockCustomerRepository.findById.mockResolvedValue(null);

		await expect(
			updateCustomerUseCase.execute({
				customerId: "missing",
				currentUser: makeUser({
					id: "admin-1",
					role: "ADMIN",
				}),
				data: {
					cpf: "12345678901",
				},
			}),
		).rejects.toThrow("Customer not found");
	});

	test("throws when authenticated user tries to edit another customer", async () => {
		await expect(
			updateCustomerUseCase.execute({
				customerId: "customer-2",
				currentUser: makeCustomer(),
				data: {
					cpf: "12345678901",
				},
			}),
		).rejects.toBeInstanceOf(UnauthorizedError);
	});
});
