import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { updateProcedureController } from "@/http/controllers/procedures/update-procedure-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { updateProcedureRouteOptions } from "@/schemas/routes/procedures/update-procedure";

const updateProcedure = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.patch(
			"/procedures/:id",
			updateProcedureRouteOptions,
			updateProcedureController.handle,
		);
};

export default updateProcedure;
