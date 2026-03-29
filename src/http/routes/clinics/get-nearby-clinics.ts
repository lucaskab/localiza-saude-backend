import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { getNearbyClinicsController } from "@/http/controllers/clinics/get-nearby-clinics-controller";
import { getNearbyClinicsRouteOptions } from "@/schemas/routes/clinics/get-nearby-clinics";

const getNearbyClinics = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.get(
			"/clinics/nearby",
			getNearbyClinicsRouteOptions,
			getNearbyClinicsController.handle,
		);
};

export default getNearbyClinics;
