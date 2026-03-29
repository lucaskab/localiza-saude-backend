import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { updateClinicController } from "@/http/controllers/clinics/update-clinic-controller";
import { updateClinicRouteOptions } from "@/schemas/routes/clinics/update-clinic";

const updateClinic = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.put(
			"/clinics/:id",
			updateClinicRouteOptions,
			updateClinicController.handle,
		);
};

export default updateClinic;
