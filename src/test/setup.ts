// Global test setup for Bun
import { beforeAll, afterAll } from "bun:test";

beforeAll(() => {
  console.log("🧪 Test setup initialized");
});

afterAll(() => {
  console.log("✅ Tests completed");
});
