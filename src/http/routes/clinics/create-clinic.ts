import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { createClinicController } from "@/http/controllers/clinics/create-clinic-controller";
import { createClinicRouteOptions } from "@/schemas/routes/clinics/create-clinic";
import { authMiddleware } from "@/http/middlewares/auth";

const createClinic = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.post("/clinics", createClinicRouteOptions, createClinicController.handle);
};

export default createClinic;
