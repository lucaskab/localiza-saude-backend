import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { createClinicController } from "@/http/controllers/clinics/create-clinic-controller";
import { createClinicRouteOptions } from "@/schemas/routes/clinics/create-clinic";

const createClinic = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.post("/clinics", createClinicRouteOptions, createClinicController.handle);
};

export default createClinic;
