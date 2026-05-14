import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { customer_medical_record } from "../../../../../prisma/generated/prisma/client";

type CustomerActor = { id: string } | null;

type UpsertMedicalRecordInput = Partial<
	Pick<
		customer_medical_record,
		| "bloodType"
		| "medications"
		| "chronicPain"
		| "preExistingConditions"
		| "allergies"
		| "surgeries"
		| "familyHistory"
		| "lifestyleNotes"
		| "emergencyContactName"
		| "emergencyContactPhone"
	>
>;

const mockCustomerRepository = {
	findByUserId: mock((): Promise<CustomerActor> => Promise.resolve(null)),
};

const mockMedicalRecordRepository = {
	upsertByUserId: mock((customerId: string, data: UpsertMedicalRecordInput) =>
		Promise.resolve({
			id: "medical-record-1",
			customerId,
			...data,
		}),
	),
};

mock.module("@/http/repositories/customers/customers-repository-implementation", () => ({
	prismaCustomerRepository: mockCustomerRepository,
}));

mock.module("@/http/repositories/medical-records/medical-records-repository-implementation", () => ({
	prismaMedicalRecordRepository: mockMedicalRecordRepository,
}));

const { upsertMyMedicalRecordUseCase } = await import("./index");

describe("upsertMyMedicalRecordUseCase", () => {
	beforeEach(() => {
		mockCustomerRepository.findByUserId.mockReset();
		mockMedicalRecordRepository.upsertByUserId.mockReset();
		mockCustomerRepository.findByUserId.mockResolvedValue(null);
		mockMedicalRecordRepository.upsertByUserId.mockImplementation(
			(customerId: string, data: UpsertMedicalRecordInput) =>
				Promise.resolve({
					id: "medical-record-1",
					customerId,
					...data,
				}),
		);
	});

	test("throws when user is not registered as customer", async () => {
		await expect(
			upsertMyMedicalRecordUseCase.execute("user-1", {
				bloodType: "O+",
			}),
		).rejects.toThrow("User is not registered as a customer");
	});

	test("upserts medical record for authenticated customer", async () => {
		mockCustomerRepository.findByUserId.mockResolvedValue({
			id: "customer-1",
		});

		const result = await upsertMyMedicalRecordUseCase.execute("user-1", {
			bloodType: "O+",
			allergies: "Dust",
		});

		expect(mockMedicalRecordRepository.upsertByUserId).toHaveBeenCalledWith(
			"customer-1",
			expect.objectContaining({
				bloodType: "O+",
				allergies: "Dust",
			}),
		);
		expect(result.medicalRecord.customerId).toBe("customer-1");
	});
});
