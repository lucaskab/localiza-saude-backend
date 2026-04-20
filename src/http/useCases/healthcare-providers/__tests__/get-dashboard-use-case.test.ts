import { describe, expect, test, beforeEach, mock } from "bun:test";

/**
 * Testes para o Dashboard Use Case
 * Mock apenas o Prisma, testa a lógica REAL
 */

describe("Dashboard Use Case - Integration Tests", () => {
  let getDashboardUseCase: any;
  let mockPrisma: any;

  beforeEach(async () => {
    mockPrisma = {
      appointment: {
        findMany: mock(() => Promise.resolve([])),
        count: mock(() => Promise.resolve(0)),
      },
      rating: {
        aggregate: mock(() => Promise.resolve({
          _avg: { rating: null },
          _count: { rating: 0 },
        })),
        findMany: mock(() => Promise.resolve([])),
      },
      appointment_procedure: {
        findMany: mock(() => Promise.resolve([])),
      },
    };

    mock.module("@/database/prisma", () => ({
      prisma: mockPrisma,
    }));

    const module = await import("../get-dashboard-use-case");
    getDashboardUseCase = module.getDashboardUseCase;
  });

  test("should calculate today's appointments by status correctly", async () => {
    mockPrisma.appointment.findMany.mockImplementation((args: any) => {
      if (args?.where?.scheduledAt?.gte && args?.where?.scheduledAt?.lte) {
        return Promise.resolve([
          { status: "SCHEDULED", totalPriceCents: 10000 },
          { status: "SCHEDULED", totalPriceCents: 10000 },
          { status: "COMPLETED", totalPriceCents: 10000 },
          { status: "CANCELLED", totalPriceCents: 10000 },
          { status: "CONFIRMED", totalPriceCents: 10000 },
        ]);
      }
      return Promise.resolve([]);
    });

    const result = await getDashboardUseCase.execute("provider-1");

    expect(result.todayAppointments.total).toBe(5);
    expect(result.todayAppointments.scheduled).toBe(2);
    expect(result.todayAppointments.completed).toBe(1);
    expect(result.todayAppointments.cancelled).toBe(1);
  });

  test("should calculate monthly revenue and growth correctly", async () => {
    let callCount = 0;
    
    mockPrisma.appointment.findMany.mockImplementation((args: any) => {
      callCount++;
      
      if (callCount === 2 && args?.where?.status?.not === "CANCELLED") {
        return Promise.resolve([
          { totalPriceCents: 15000 },
          { totalPriceCents: 20000 },
          { totalPriceCents: 10000 },
        ]);
      }
      
      if (callCount === 3 && args?.where?.status?.not === "CANCELLED") {
        return Promise.resolve([
          { totalPriceCents: 15000 },
          { totalPriceCents: 15000 },
        ]);
      }
      
      return Promise.resolve([]);
    });

    const result = await getDashboardUseCase.execute("provider-1");

    expect(result.monthlyRevenue.currentMonth).toBe(45000);
    expect(result.monthlyRevenue.lastMonth).toBe(30000);
    expect(result.monthlyRevenue.growthPercentage).toBe(50.0);
  });

  test("should handle 100% growth when last month had zero revenue", async () => {
    let callCount = 0;
    
    mockPrisma.appointment.findMany.mockImplementation((args: any) => {
      callCount++;
      
      if (callCount === 2 && args?.where?.status?.not === "CANCELLED") {
        return Promise.resolve([{ totalPriceCents: 10000 }]);
      }
      
      if (callCount === 3 && args?.where?.status?.not === "CANCELLED") {
        return Promise.resolve([]);
      }
      
      return Promise.resolve([]);
    });

    const result = await getDashboardUseCase.execute("provider-1");

    expect(result.monthlyRevenue.growthPercentage).toBe(100);
  });

  test("should calculate negative growth correctly", async () => {
    let callCount = 0;
    
    mockPrisma.appointment.findMany.mockImplementation((args: any) => {
      callCount++;
      
      if (callCount === 2 && args?.where?.status?.not === "CANCELLED") {
        return Promise.resolve([{ totalPriceCents: 5000 }]);
      }
      
      if (callCount === 3 && args?.where?.status?.not === "CANCELLED") {
        return Promise.resolve([{ totalPriceCents: 10000 }]);
      }
      
      return Promise.resolve([]);
    });

    const result = await getDashboardUseCase.execute("provider-1");

    expect(result.monthlyRevenue.growthPercentage).toBe(-50.0);
  });

  test("should calculate cancellation rate correctly", async () => {
    // Ordem real das chamadas ao count no use case:
    // 1. upcomingAppointments
    // 2. thisMonthTotal
    // 3. lastMonthTotal
    // 4-10. week trend (7 dias)
    // 11. thisMonthCancelled
    // 12. lastMonthCancelled
    
    let countCallIndex = 0;
    const countResults = [
      5,   // upcomingAppointments
      10,  // thisMonthTotal
      8,   // lastMonthTotal
      0,   // week trend day 1
      0,   // week trend day 2
      0,   // week trend day 3
      0,   // week trend day 4
      0,   // week trend day 5
      0,   // week trend day 6
      0,   // week trend day 7
      3,   // thisMonthCancelled
      2,   // lastMonthCancelled
    ];
    
    mockPrisma.appointment.count.mockImplementation(() => {
      return Promise.resolve(countResults[countCallIndex++] || 0);
    });

    const result = await getDashboardUseCase.execute("provider-1");

    // 3/10 = 30%, 2/8 = 25%
    expect(result.cancellationRate.thisMonth).toBe(30.0);
    expect(result.cancellationRate.lastMonth).toBe(25.0);
  });

  test("should return 7 days in week trend", async () => {
    mockPrisma.appointment.count.mockResolvedValue(5);

    const result = await getDashboardUseCase.execute("provider-1");

    expect(result.appointments.weekTrend).toHaveLength(7);
    expect(result.appointments.weekTrend[0]).toHaveProperty("date");
    expect(result.appointments.weekTrend[0]).toHaveProperty("count");
  });

  test("should aggregate popular procedures correctly", async () => {
    mockPrisma.appointment_procedure.findMany.mockResolvedValueOnce([
      {
        procedureId: "proc-1",
        procedure: { name: "Consultation", priceInCents: 10000 },
        appointment: { status: "COMPLETED" },
      },
      {
        procedureId: "proc-1",
        procedure: { name: "Consultation", priceInCents: 10000 },
        appointment: { status: "COMPLETED" },
      },
      {
        procedureId: "proc-2",
        procedure: { name: "Exam", priceInCents: 5000 },
        appointment: { status: "COMPLETED" },
      },
    ]);

    const result = await getDashboardUseCase.execute("provider-1");

    expect(result.popularProcedures).toHaveLength(2);
    expect(result.popularProcedures[0].count).toBe(2);
    expect(result.popularProcedures[0].revenue).toBe(20000);
  });

  test("should exclude cancelled appointments from procedure revenue", async () => {
    mockPrisma.appointment_procedure.findMany.mockResolvedValueOnce([
      {
        procedureId: "proc-1",
        procedure: { name: "Consultation", priceInCents: 10000 },
        appointment: { status: "COMPLETED" },
      },
      {
        procedureId: "proc-1",
        procedure: { name: "Consultation", priceInCents: 10000 },
        appointment: { status: "CANCELLED" },
      },
    ]);

    const result = await getDashboardUseCase.execute("provider-1");

    expect(result.popularProcedures[0].count).toBe(2);
    expect(result.popularProcedures[0].revenue).toBe(10000);
  });

  test("should format percentages to 2 decimal places", async () => {
    let callCount = 0;
    
    mockPrisma.appointment.findMany.mockImplementation((args: any) => {
      callCount++;
      
      if (callCount === 2 && args?.where?.status?.not === "CANCELLED") {
        return Promise.resolve([{ totalPriceCents: 10000 }]);
      }
      
      if (callCount === 3 && args?.where?.status?.not === "CANCELLED") {
        return Promise.resolve([{ totalPriceCents: 7500 }]);
      }
      
      return Promise.resolve([]);
    });

    const result = await getDashboardUseCase.execute("provider-1");

    expect(result.monthlyRevenue.growthPercentage).toBe(33.33);
  });

  test("should return zero values for empty data", async () => {
    const result = await getDashboardUseCase.execute("provider-1");

    expect(result.todayAppointments.total).toBe(0);
    expect(result.monthlyRevenue.currentMonth).toBe(0);
    expect(result.ratings.averageRating).toBe(0);
    expect(result.patients.totalUnique).toBe(0);
  });
});
