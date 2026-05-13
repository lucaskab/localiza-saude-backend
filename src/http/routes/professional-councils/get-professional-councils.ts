import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { getProfessionalCouncilsController } from "@/http/controllers/professional-councils/get-professional-councils-controller";
import { getProfessionalCouncilsRouteOptions } from "@/schemas/routes/professional-councils/get-professional-councils";

const getProfessionalCouncils = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.get(
			"/professional-councils",
			getProfessionalCouncilsRouteOptions,
			getProfessionalCouncilsController.handle,
		);
};

export default getProfessionalCouncils;
