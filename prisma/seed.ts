import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";
import { runSeed } from "./seed/index";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

runSeed(prisma)
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (error) => {
		console.error("❌ Error during seed:", error);
		await prisma.$disconnect();
		process.exit(1);
	});
