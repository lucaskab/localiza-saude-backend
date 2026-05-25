import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { getAuthMeController } from "@/http/controllers/auth/get-auth-me-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { getAuthMeRouteOptions } from "@/schemas/routes/auth/get-auth-me";

const getAuthMe = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.get("/auth/me", getAuthMeRouteOptions, getAuthMeController.handle)
		.get("/me", getAuthMeRouteOptions, getAuthMeController.handle);
};

export default getAuthMe;
