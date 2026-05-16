import { beforeEach, describe, expect, mock, test } from "bun:test";
import { makePatientProfile, makeUser } from "@/http/tests/factories";

type AppointmentRecord = {
	id: string;
	healthcareProviderId: string;
	customerId: string | null;
	patientProfileId: string | null;
	status: string;
};

type EvolutionNoteRecord = {
	id: string;
	appointmentId: string;
	customerId: string | null;
	patientProfileId: string | null;
	healthcareProviderId: string;
	subjective: string | null;
	objective: string | null;
	assessment: string | null;
	plan: string | null;
	painLevel: number | null;
	painLocation: string | null;
	evolutionStatus: "IMPROVED" | "STABLE" | "WORSENED" | null;
	createdAt: Date;
	updatedAt: Date;
	appointment: {
		id: string;
		scheduledAt: Date;
		status: string;
	};
};

const mockAppointmentRepository = {
	findById: mock(
		(): Promise<AppointmentRecord> =>
			Promise.resolve({
				id: "appointment-1",
				healthcareProviderId: "provider-1",
				customerId: "customer-1",
				patientProfileId: null,
				status: "COMPLETED",
			}),
	),
};

const mockEvolutionNotesRepository = {
	findByAppointmentId: mock((): Promise<EvolutionNoteRecord | null> =>
		Promise.resolve(null),
	),
	findHistory: mock((): Promise<EvolutionNoteRecord[]> => Promise.resolve([])),
};

mock.module(
	"@/http/repositories/appointments/appointments-repository-implementation",
	() => ({
		prismaAppointmentRepository: mockAppointmentRepository,
	}),
);

mock.module(
	"@/http/repositories/appointment-evolution-notes/appointment-evolution-notes-repository-implementation",
	() => ({
		prismaAppointmentEvolutionNotesRepository: mockEvolutionNotesRepository,
	}),
);

const { getAppointmentEvolutionNoteUseCase } = await import("./index");

describe("getAppointmentEvolutionNoteUseCase", () => {
	beforeEach(() => {
		mockAppointmentRepository.findById.mockReset();
		mockEvolutionNotesRepository.findByAppointmentId.mockReset();
		mockEvolutionNotesRepository.findHistory.mockReset();

		mockAppointmentRepository.findById.mockResolvedValue({
			id: "appointment-1",
			healthcareProviderId: "provider-1",
			customerId: "customer-1",
			patientProfileId: null,
			status: "COMPLETED",
		});
		mockEvolutionNotesRepository.findByAppointmentId.mockResolvedValue(null);
		mockEvolutionNotesRepository.findHistory.mockResolvedValue([]);
	});

	test("returns current evolution note and history for the appointment provider", async () => {
		mockEvolutionNotesRepository.findByAppointmentId.mockResolvedValue({
			id: "note-1",
			appointmentId: "appointment-1",
			customerId: "customer-1",
			patientProfileId: null,
			healthcareProviderId: "provider-1",
			subjective: "Paciente relata melhora",
			objective: null,
			assessment: null,
			plan: null,
			painLevel: 3,
			painLocation: "ombro",
			evolutionStatus: "IMPROVED",
			createdAt: new Date(),
			updatedAt: new Date(),
			appointment: {
				id: "appointment-1",
				scheduledAt: new Date("2026-05-12T12:00:00.000Z"),
				status: "COMPLETED",
			},
		});
		mockEvolutionNotesRepository.findHistory.mockResolvedValue([
			{
				id: "note-older",
				appointmentId: "appointment-0",
				customerId: "customer-1",
				patientProfileId: null,
				healthcareProviderId: "provider-1",
				subjective: "Ainda com dor",
				objective: null,
				assessment: null,
				plan: null,
				painLevel: 6,
				painLocation: "ombro",
				evolutionStatus: "STABLE",
				createdAt: new Date(),
				updatedAt: new Date(),
				appointment: {
					id: "appointment-0",
					scheduledAt: new Date("2026-05-05T12:00:00.000Z"),
					status: "COMPLETED",
				},
			},
		]);

		const result = await getAppointmentEvolutionNoteUseCase.execute(
			"appointment-1",
			makeUser({ id: "provider-1", role: "HEALTHCARE_PROVIDER" }),
		);

		expect(result.evolutionNote?.id).toBe("note-1");
		expect(result.history).toHaveLength(1);
		expect(mockEvolutionNotesRepository.findHistory).toHaveBeenCalledWith(
			expect.objectContaining({
				healthcareProviderId: "provider-1",
				customerId: "customer-1",
				excludeAppointmentId: "appointment-1",
			}),
		);
	});

	test("returns empty state before the appointment starts when there is no note yet", async () => {
		mockAppointmentRepository.findById.mockResolvedValue({
			id: "appointment-1",
			healthcareProviderId: "provider-1",
			customerId: null,
			patientProfileId: "profile-1",
			status: "CONFIRMED",
		});

		const result = await getAppointmentEvolutionNoteUseCase.execute(
			"appointment-1",
			makeUser({ id: "provider-1", role: "HEALTHCARE_PROVIDER" }),
		);

		expect(result).toEqual({
			evolutionNote: null,
			history: [],
		});
		expect(mockEvolutionNotesRepository.findHistory).not.toHaveBeenCalled();
	});

	test("rejects access for unrelated providers", async () => {
		await expect(
			getAppointmentEvolutionNoteUseCase.execute(
				"appointment-1",
				makeUser({ id: "provider-2", role: "HEALTHCARE_PROVIDER" }),
			),
		).rejects.toThrow("You cannot access this appointment evolution note");
	});
});
