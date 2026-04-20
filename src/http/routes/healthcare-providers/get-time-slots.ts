import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { getTimeSlotsController } from "@/http/controllers/healthcare-providers/get-time-slots-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { getTimeSlotsRouteOptions } from "@/schemas/routes/healthcare-providers/get-time-slots";

const getTimeSlots = (app: FastifyInstance) => {
	console.log(
		"🚀 Registering GET /healthcare-providers/:healthcareProviderId/slots",
	);

	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.get(
			"/healthcare-providers/:healthcareProviderId/slots",
			getTimeSlotsRouteOptions,
			getTimeSlotsController.handle,
		);
};

export default getTimeSlots;
