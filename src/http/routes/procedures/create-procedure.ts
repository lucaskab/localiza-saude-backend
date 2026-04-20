import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { createProcedureController } from "@/http/controllers/procedures/create-procedure-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { createProcedureRouteOptions } from "@/schemas/routes/procedures/create-procedure";

const createProcedure = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.post(
			"/procedures",
			createProcedureRouteOptions,
			createProcedureController.handle,
		);
};

export default createProcedure;
