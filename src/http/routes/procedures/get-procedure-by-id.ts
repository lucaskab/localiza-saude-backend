import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { getProcedureByIdController } from "@/http/controllers/procedures/get-procedure-by-id-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { getProcedureByIdRouteOptions } from "@/schemas/routes/procedures/get-procedure-by-id";

const getProcedureById = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.get(
			"/procedures/:id",
			getProcedureByIdRouteOptions,
			getProcedureByIdController.handle,
		);
};

export default getProcedureById;
