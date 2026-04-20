import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { getClinicByIdController } from "@/http/controllers/clinics/get-clinic-by-id-controller";
import { getClinicByIdRouteOptions } from "@/schemas/routes/clinics/get-clinic-by-id";
import { authMiddleware } from "@/http/middlewares/auth";

const getClinicById = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.get(
			"/clinics/:id",
			getClinicByIdRouteOptions,
			getClinicByIdController.handle,
		);
};

export default getClinicById;
