import { beforeEach, describe, expect, mock, test } from "bun:test";

const mockAppointmentRepository = {
	findById: mock(() =>
		Promise.resolve({
			id: "appointment-1",
			status: "SCHEDULED",
		}),
	),
};

mock.module(
	"@/http/repositories/appointments/appointments-repository-implementation",
	() => ({
		prismaAppointmentRepository: mockAppointmentRepository,
	}),
);

const { getAppointmentByIdUseCase } = await import("./index");

describe("getAppointmentByIdUseCase", () => {
	beforeEach(() => {
		mockAppointmentRepository.findById.mockReset();
		mockAppointmentRepository.findById.mockResolvedValue({
			id: "appointment-1",
			status: "SCHEDULED",
		});
	});

	test("returns appointment by id", async () => {
		const result = await getAppointmentByIdUseCase.execute("appointment-1");

		expect(mockAppointmentRepository.findById).toHaveBeenCalledWith(
			"appointment-1",
		);
		expect(result.appointment?.id).toBe("appointment-1");
	});
});
