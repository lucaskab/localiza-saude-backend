import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { completeCustomerProfileController } from "@/http/controllers/auth/complete-customer-profile-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { completeCustomerProfileRouteOptions } from "@/schemas/routes/auth/customer-onboarding";

const completeCustomerProfile = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.post(
			"/auth/onboarding/customer-profile",
			completeCustomerProfileRouteOptions,
			completeCustomerProfileController.handle,
		);
};

export default completeCustomerProfile;
