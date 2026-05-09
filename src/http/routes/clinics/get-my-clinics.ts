import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { getMyClinicsController } from "@/http/controllers/clinics/get-my-clinics-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { getMyClinicsRouteOptions } from "@/schemas/routes/clinics/get-my-clinics";

const getMyClinics = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.get("/clinics/my", getMyClinicsRouteOptions, getMyClinicsController.handle);
};

export default getMyClinics;
