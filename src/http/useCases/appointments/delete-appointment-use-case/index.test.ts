import { beforeEach, describe, expect, mock, test } from "bun:test";

const mockAppointmentRepository = {
	delete: mock(() => Promise.resolve(undefined)),
};

mock.module(
	"@/http/repositories/appointments/appointments-repository-implementation",
	() => ({
		prismaAppointmentRepository: mockAppointmentRepository,
	}),
);

const { deleteAppointmentUseCase } = await import("./index");

describe("deleteAppointmentUseCase", () => {
	beforeEach(() => {
		mockAppointmentRepository.delete.mockReset();
		mockAppointmentRepository.delete.mockResolvedValue(undefined);
	});

	test("deletes appointment and returns success message", async () => {
		const result = await deleteAppointmentUseCase.execute("appointment-1");

		expect(mockAppointmentRepository.delete).toHaveBeenCalledWith(
			"appointment-1",
		);
		expect(result.message).toBe("Appointment deleted successfully");
	});
});
