import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { getPatientProfilesController } from "@/http/controllers/patient-profiles/get-patient-profiles-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { getPatientProfilesRouteOptions } from "@/schemas/routes/patient-profiles/get-patient-profiles";

const getPatientProfiles = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.get(
			"/patient-profiles",
			getPatientProfilesRouteOptions,
			getPatientProfilesController.handle,
		);
};

export default getPatientProfiles;
