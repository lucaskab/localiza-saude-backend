import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { finishCustomerOnboardingController } from "@/http/controllers/auth/finish-customer-onboarding-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { finishCustomerOnboardingRouteOptions } from "@/schemas/routes/auth/customer-onboarding";

const finishCustomerOnboarding = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.post(
			"/auth/onboarding/customer-finish",
			finishCustomerOnboardingRouteOptions,
			finishCustomerOnboardingController.handle,
		);
};

export default finishCustomerOnboarding;
