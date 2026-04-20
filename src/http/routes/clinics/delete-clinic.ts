import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { deleteClinicController } from "@/http/controllers/clinics/delete-clinic-controller";
import { deleteClinicRouteOptions } from "@/schemas/routes/clinics/delete-clinic";
import { authMiddleware } from "@/http/middlewares/auth";

const deleteClinic = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.delete(
			"/clinics/:id",
			deleteClinicRouteOptions,
			deleteClinicController.handle,
		);
};

export default deleteClinic;
