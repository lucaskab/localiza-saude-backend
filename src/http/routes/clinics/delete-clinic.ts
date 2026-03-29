import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { deleteClinicController } from "@/http/controllers/clinics/delete-clinic-controller";
import { deleteClinicRouteOptions } from "@/schemas/routes/clinics/delete-clinic";

const deleteClinic = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.delete(
			"/clinics/:id",
			deleteClinicRouteOptions,
			deleteClinicController.handle,
		);
};

export default deleteClinic;
