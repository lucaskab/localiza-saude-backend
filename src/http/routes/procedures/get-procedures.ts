import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { getProceduresController } from "@/http/controllers/procedures/get-procedures-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { getProceduresRouteOptions } from "@/schemas/routes/procedures/get-procedures";

const getProcedures = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.get(
			"/procedures",
			getProceduresRouteOptions,
			getProceduresController.handle,
		);
};

export default getProcedures;
