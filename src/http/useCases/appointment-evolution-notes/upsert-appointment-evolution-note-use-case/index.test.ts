import { beforeEach, describe, expect, mock, test } from "bun:test";
import { makeUser } from "@/http/tests/factories";

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
	upsertByAppointmentId: mock(
		({
			appointmentId,
			customerId,
			patientProfileId,
			healthcareProviderId,
			data,
		}: {
			appointmentId: string;
			customerId?: string | null;
			patientProfileId?: string | null;
			healthcareProviderId: string;
			data: Record<string, unknown>;
		}): Promise<EvolutionNoteRecord> =>
			Promise.resolve({
				id: "note-1",
				appointmentId,
				customerId: customerId ?? null,
				patientProfileId: patientProfileId ?? null,
				healthcareProviderId,
				subjective: (data.subjective as string | null) ?? null,
				objective: (data.objective as string | null) ?? null,
				assessment: (data.assessment as string | null) ?? null,
				plan: (data.plan as string | null) ?? null,
				painLevel: (data.painLevel as number | null) ?? null,
				painLocation: (data.painLocation as string | null) ?? null,
				evolutionStatus:
					(data.evolutionStatus as EvolutionNoteRecord["evolutionStatus"]) ?? null,
				createdAt: new Date(),
				updatedAt: new Date(),
				appointment: {
					id: appointmentId,
					scheduledAt: new Date("2026-05-12T12:00:00.000Z"),
					status: "COMPLETED",
				},
			}),
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

const { upsertAppointmentEvolutionNoteUseCase } = await import("./index");

describe("upsertAppointmentEvolutionNoteUseCase", () => {
	beforeEach(() => {
		mockAppointmentRepository.findById.mockReset();
		mockEvolutionNotesRepository.upsertByAppointmentId.mockReset();
		mockEvolutionNotesRepository.findHistory.mockReset();

		mockAppointmentRepository.findById.mockResolvedValue({
			id: "appointment-1",
			healthcareProviderId: "provider-1",
			customerId: "customer-1",
			patientProfileId: null,
			status: "COMPLETED",
		});
		mockEvolutionNotesRepository.findHistory.mockResolvedValue([]);
		mockEvolutionNotesRepository.upsertByAppointmentId.mockImplementation(
			({
				appointmentId,
				customerId,
				patientProfileId,
				healthcareProviderId,
				data,
			}) =>
				Promise.resolve({
					id: "note-1",
					appointmentId,
					customerId: customerId ?? null,
					patientProfileId: patientProfileId ?? null,
					healthcareProviderId,
					subjective: (data.subjective as string | null) ?? null,
					objective: (data.objective as string | null) ?? null,
					assessment: (data.assessment as string | null) ?? null,
					plan: (data.plan as string | null) ?? null,
					painLevel: (data.painLevel as number | null) ?? null,
					painLocation: (data.painLocation as string | null) ?? null,
					evolutionStatus:
						(data.evolutionStatus as EvolutionNoteRecord["evolutionStatus"]) ?? null,
					createdAt: new Date(),
					updatedAt: new Date(),
					appointment: {
						id: appointmentId,
						scheduledAt: new Date("2026-05-12T12:00:00.000Z"),
						status: "COMPLETED",
					},
				}),
		);
	});

	test("saves the evolution note for a completed appointment", async () => {
		const result = await upsertAppointmentEvolutionNoteUseCase.execute(
			"appointment-1",
			makeUser({ id: "provider-1", role: "HEALTHCARE_PROVIDER" }),
			{
				subjective: "Paciente relata menos dor",
				painLevel: 2,
				painLocation: "ombro direito",
				evolutionStatus: "IMPROVED",
				plan: "Manter exercícios",
			},
		);

		expect(mockEvolutionNotesRepository.upsertByAppointmentId).toHaveBeenCalledWith(
			expect.objectContaining({
				appointmentId: "appointment-1",
				customerId: "customer-1",
				healthcareProviderId: "provider-1",
			}),
		);
		expect(result.evolutionNote.painLevel).toBe(2);
	});

	test("rejects saving notes before the appointment starts", async () => {
		mockAppointmentRepository.findById.mockResolvedValue({
			id: "appointment-1",
			healthcareProviderId: "provider-1",
			customerId: "customer-1",
			patientProfileId: null,
			status: "CONFIRMED",
		});

		await expect(
			upsertAppointmentEvolutionNoteUseCase.execute(
				"appointment-1",
				makeUser({ id: "provider-1", role: "HEALTHCARE_PROVIDER" }),
				{
					subjective: "Tentando salvar cedo demais",
				},
			),
		).rejects.toThrow(
			"Evolution notes can only be saved after the appointment starts",
		);
	});

	test("includes patient history in the response", async () => {
		mockEvolutionNotesRepository.findHistory.mockResolvedValue([
			{
				id: "note-older",
				appointmentId: "appointment-0",
				customerId: "customer-1",
				patientProfileId: null,
				healthcareProviderId: "provider-1",
				subjective: "Ainda com rigidez",
				objective: null,
				assessment: null,
				plan: null,
				painLevel: 5,
				painLocation: "ombro direito",
				evolutionStatus: "STABLE",
				createdAt: new Date(),
				updatedAt: new Date(),
				appointment: {
					id: "appointment-0",
					scheduledAt: new Date("2026-05-01T12:00:00.000Z"),
					status: "COMPLETED",
				},
			},
		]);

		const result = await upsertAppointmentEvolutionNoteUseCase.execute(
			"appointment-1",
			makeUser({ id: "provider-1", role: "HEALTHCARE_PROVIDER" }),
			{
				subjective: "Paciente com evolução estável",
				evolutionStatus: "STABLE",
			},
		);

		expect(result.history).toHaveLength(1);
		expect(result.history[0]?.appointmentId).toBe("appointment-0");
	});
});
