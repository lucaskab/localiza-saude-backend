import { defineConfig } from "prisma/config";
import { env } from "./src/env";

export default defineConfig({
	schema: "./prisma/schema",
	migrations: {
		path: "prisma/migrations",
		seed: "bun prisma/seed.ts",
	},
	datasource: {
		url: env.DATABASE_URL,
	},
});
