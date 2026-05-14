import { beforeEach, describe, expect, mock, test } from "bun:test";
import { makeUser } from "@/http/tests/factories";
import type { user } from "../../../../../prisma/generated/prisma/client";

const mockCustomerRepository = {
	findById: mock((_: string): Promise<user | null> =>
		Promise.resolve(
			makeUser({
				id: "customer-1",
				role: "CUSTOMER",
			}),
		),
	),
	delete: mock((_: string): Promise<void> => Promise.resolve()),
};

mock.module(
	"@/http/repositories/customers/customers-repository-implementation",
	() => ({
		prismaCustomerRepository: mockCustomerRepository,
	}),
);

const { deleteCustomerUseCase } = await import("./index");

describe("deleteCustomerUseCase", () => {
	beforeEach(() => {
		mockCustomerRepository.findById.mockReset();
		mockCustomerRepository.delete.mockReset();
		mockCustomerRepository.findById.mockResolvedValue(
			makeUser({
				id: "customer-1",
				role: "CUSTOMER",
			}),
		);
		mockCustomerRepository.delete.mockResolvedValue(undefined);
	});

	test("deletes customer when profile exists", async () => {
		const result = await deleteCustomerUseCase.execute("customer-1");

		expect(mockCustomerRepository.delete).toHaveBeenCalledWith("customer-1");
		expect(result.message).toBe("Customer deleted successfully");
	});

	test("throws when customer does not exist", async () => {
		mockCustomerRepository.findById.mockResolvedValue(null);

		await expect(deleteCustomerUseCase.execute("missing")).rejects.toThrow(
			"Customer not found",
		);
	});
});
