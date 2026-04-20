import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { deleteProcedureController } from "@/http/controllers/procedures/delete-procedure-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { deleteProcedureRouteOptions } from "@/schemas/routes/procedures/delete-procedure";

const deleteProcedure = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.delete(
			"/procedures/:id",
			deleteProcedureRouteOptions,
			deleteProcedureController.handle,
		);
};

export default deleteProcedure;
