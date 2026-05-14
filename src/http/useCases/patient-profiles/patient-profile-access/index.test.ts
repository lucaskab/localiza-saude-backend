import { beforeEach, describe, expect, mock, test } from "bun:test";
import { makeUser } from "@/http/tests/factories";

type CustomerActor = { id: string } | null;

const mockCustomerRepository = {
	findByUserId: mock((): Promise<CustomerActor> => Promise.resolve(null)),
};

type ProviderActor = { id: string } | null;

const mockHealthcareProviderRepository = {
	findByUserId: mock((): Promise<ProviderActor> => Promise.resolve(null)),
};

mock.module(
	"@/http/repositories/customers/customers-repository-implementation",
	() => ({
		prismaCustomerRepository: mockCustomerRepository,
	}),
);

mock.module(
	"@/http/repositories/healthcare-providers/healthcare-providers-repository-implementation",
	() => ({
		prismaHealthcareProviderRepository: mockHealthcareProviderRepository,
	}),
);

const { getPatientProfileActor } = await import("./index");

describe("getPatientProfileActor", () => {
	beforeEach(() => {
		mockCustomerRepository.findByUserId.mockReset();
		mockHealthcareProviderRepository.findByUserId.mockReset();
		mockCustomerRepository.findByUserId.mockResolvedValue(null);
		mockHealthcareProviderRepository.findByUserId.mockResolvedValue(null);
	});

	test("returns both customer and provider actors for the same user id", async () => {
		mockCustomerRepository.findByUserId.mockResolvedValue({ id: "customer-1" });
		mockHealthcareProviderRepository.findByUserId.mockResolvedValue({
			id: "provider-1",
		});

		const result = await getPatientProfileActor({
			...makeUser({ id: "user-1" }),
		});

		expect(mockCustomerRepository.findByUserId).toHaveBeenCalledWith("user-1");
		expect(mockHealthcareProviderRepository.findByUserId).toHaveBeenCalledWith(
			"user-1",
		);
		expect(result.customer).toMatchObject({ id: "customer-1" });
		expect(result.healthcareProvider).toMatchObject({ id: "provider-1" });
	});
});
