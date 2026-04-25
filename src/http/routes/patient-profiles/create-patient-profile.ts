import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { createPatientProfileController } from "@/http/controllers/patient-profiles/create-patient-profile-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { createPatientProfileRouteOptions } from "@/schemas/routes/patient-profiles/create-patient-profile";

const createPatientProfile = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.post(
			"/patient-profiles",
			createPatientProfileRouteOptions,
			createPatientProfileController.handle,
		);
};

export default createPatientProfile;
