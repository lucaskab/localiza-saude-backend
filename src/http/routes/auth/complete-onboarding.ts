import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { completeOnboardingController } from "@/http/controllers/auth/complete-onboarding-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { completeOnboardingRouteOptions } from "@/schemas/routes/auth/complete-onboarding";

const completeOnboarding = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.post(
			"/auth/onboarding/complete",
			completeOnboardingRouteOptions,
			completeOnboardingController.handle,
		);
};

export default completeOnboarding;
