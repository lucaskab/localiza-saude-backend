import type { user } from "../../prisma/generated/prisma/client";
import "fastify";

declare module "fastify" {
	export interface FastifyRequest {
		getCurrentUserId: () => Promise<string>;
		getCurrentUser: () => Promise<user>;
	}
}
