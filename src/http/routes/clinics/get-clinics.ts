import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { getClinicsController } from "@/http/controllers/clinics/get-clinics-controller";
import { getClinicsRouteOptions } from "@/schemas/routes/clinics/get-clinics";

const getClinics = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.get("/clinics", getClinicsRouteOptions, getClinicsController.handle);
};

export default getClinics;
