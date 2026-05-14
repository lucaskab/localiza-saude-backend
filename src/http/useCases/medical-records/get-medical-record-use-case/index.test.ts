import { beforeEach, describe, expect, mock, test } from "bun:test";
import { makeMedicalRecord, makePatientProfile, makeUser } from "@/http/tests/factories";

const blankMedicalRecord = makeMedicalRecord({
	id: "record-1",
	customerId: "customer-1",
	bloodType: "",
	medications: "",
	chronicPain: "",
	preExistingConditions: "",
	allergies: "",
	surgeries: "",
	familyHistory: "",
	lifestyleNotes: "",
	emergencyContactName: "",
	emergencyContactPhone: "",
});

type AppointmentRecord = {
	id: string;
	healthcareProviderId: string;
	customerId: string | null;
	status: string;
	patientProfile: ReturnType<typeof makePatientProfile> | null;
};

const mockAppointmentRepository = {
	existsConfirmedByCustomerAndProfessional: mock(() => Promise.resolve(true)),
	findById: mock(
		(): Promise<AppointmentRecord> =>
		Promise.resolve({
			id: "appointment-1",
			healthcareProviderId: "provider-1",
			customerId: "customer-1",
			status: "CONFIRMED",
			patientProfile: null,
		}),
	),
};

type CustomerActor = { id: string } | null;

const mockCustomerRepository = {
	findByUserId: mock((): Promise<CustomerActor> => Promise.resolve({ id: "customer-1" })),
	findById: mock((): Promise<CustomerActor> => Promise.resolve({ id: "customer-1" })),
};

type ProviderActor = { id: string } | null;

const mockProviderRepository = {
	findByUserId: mock((): Promise<ProviderActor> => Promise.resolve({ id: "provider-1" })),
};

const mockMedicalRecordRepository = {
	findByUserId: mock(() => Promise.resolve(blankMedicalRecord)),
};

mock.module(
	"@/http/repositories/appointments/appointments-repository-implementation",
	() => ({
		prismaAppointmentRepository: mockAppointmentRepository,
	}),
);

mock.module(
	"@/http/repositories/customers/customers-repository-implementation",
	() => ({
		prismaCustomerRepository: mockCustomerRepository,
	}),
);

mock.module(
	"@/http/repositories/healthcare-providers/healthcare-providers-repository-implementation",
	() => ({
		prismaHealthcareProviderRepository: mockProviderRepository,
	}),
);

mock.module(
	"@/http/repositories/medical-records/medical-records-repository-implementation",
	() => ({
		prismaMedicalRecordRepository: mockMedicalRecordRepository,
	}),
);

const {
	getAppointmentMedicalRecordUseCase,
	getCustomerMedicalRecordUseCase,
	getMyMedicalRecordUseCase,
} = await import("./index");

describe("medical record read use cases", () => {
	beforeEach(() => {
		mockAppointmentRepository.existsConfirmedByCustomerAndProfessional.mockReset();
		mockAppointmentRepository.findById.mockReset();
		mockCustomerRepository.findByUserId.mockReset();
		mockCustomerRepository.findById.mockReset();
		mockProviderRepository.findByUserId.mockReset();
		mockMedicalRecordRepository.findByUserId.mockReset();

		mockAppointmentRepository.existsConfirmedByCustomerAndProfessional.mockResolvedValue(
			true,
		);
		mockAppointmentRepository.findById.mockResolvedValue({
			id: "appointment-1",
			healthcareProviderId: "provider-1",
			customerId: "customer-1",
			status: "CONFIRMED",
			patientProfile: null,
		});
		mockCustomerRepository.findByUserId.mockResolvedValue({ id: "customer-1" });
		mockCustomerRepository.findById.mockResolvedValue({ id: "customer-1" });
		mockProviderRepository.findByUserId.mockResolvedValue({ id: "provider-1" });
		mockMedicalRecordRepository.findByUserId.mockResolvedValue(blankMedicalRecord);
	});

	test("gets own medical record for a customer", async () => {
		const result = await getMyMedicalRecordUseCase.execute("user-1");

		expect(mockCustomerRepository.findByUserId).toHaveBeenCalledWith("user-1");
		expect(result.medicalRecord?.id).toBe("record-1");
	});

	test("returns null for provider access when record has no meaningful content", async () => {
		const result = await getCustomerMedicalRecordUseCase.execute(
			"customer-1",
			makeUser({ id: "provider-user-1", role: "HEALTHCARE_PROVIDER" }),
		);

		expect(
			mockAppointmentRepository.existsConfirmedByCustomerAndProfessional,
		).toHaveBeenCalledWith("customer-1", "provider-1");
		expect(result.medicalRecord).toBeNull();
	});

	test("returns patient profile data for confirmed appointment records", async () => {
		mockAppointmentRepository.findById.mockResolvedValue({
			id: "appointment-1",
			healthcareProviderId: "provider-1",
			customerId: null,
			status: "CONFIRMED",
			patientProfile: makePatientProfile({
				id: "profile-1",
				bloodType: "O+",
				medications: "Vitamina D",
				chronicPain: "",
				preExistingConditions: "",
				allergies: "",
				surgeries: "",
				familyHistory: "",
				lifestyleNotes: "",
				emergencyContactName: "",
				emergencyContactPhone: "",
			}),
		});

		const result = await getAppointmentMedicalRecordUseCase.execute(
			"appointment-1",
			makeUser({ id: "provider-user-1", role: "HEALTHCARE_PROVIDER" }),
		);

		expect(result.medicalRecord).toMatchObject({
			patientProfileId: "profile-1",
			bloodType: "O+",
		});
	});

	test("rejects provider access when actor is unrelated", async () => {
		mockProviderRepository.findByUserId.mockResolvedValue(null);

		await expect(
			getAppointmentMedicalRecordUseCase.execute(
				"appointment-1",
				makeUser({ id: "customer-2", role: "CUSTOMER" }),
			),
		).rejects.toThrow("You cannot access this medical record");
	});
});
