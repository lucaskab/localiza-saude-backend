import { beforeEach, describe, expect, mock, test } from "bun:test";

const mockPrisma = {
	appointment: {
		count: mock(() => Promise.resolve(0)),
	},
	customer_favorite_provider: {
		count: mock(() => Promise.resolve(0)),
	},
};

mock.module("@/database/prisma", () => ({
	prisma: mockPrisma,
}));

const { getCustomerHomeSummaryUseCase } = await import("./index");

describe("getCustomerHomeSummaryUseCase", () => {
	beforeEach(() => {
		mockPrisma.appointment.count.mockReset();
		mockPrisma.customer_favorite_provider.count.mockReset();
		mockPrisma.appointment.count
			.mockResolvedValueOnce(8)
			.mockResolvedValueOnce(3);
		mockPrisma.customer_favorite_provider.count.mockResolvedValue(2);
	});

	test("returns appointment and favorites counts for the customer", async () => {
		const result = await getCustomerHomeSummaryUseCase.execute("customer-1");

		expect(result.summary).toEqual({
			totalAppointments: 8,
			upcomingAppointments: 3,
			favoritesCount: 2,
		});
		expect(mockPrisma.appointment.count).toHaveBeenNthCalledWith(1, {
			where: { customerId: "customer-1" },
		});
		expect(mockPrisma.appointment.count).toHaveBeenNthCalledWith(2, {
			where: {
				customerId: "customer-1",
				status: { in: ["SCHEDULED", "CONFIRMED", "IN_PROGRESS"] },
			},
		});
		expect(mockPrisma.customer_favorite_provider.count).toHaveBeenCalledWith({
			where: { customerId: "customer-1" },
		});
	});
});
