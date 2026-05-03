import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { getAppInfoController } from "@/http/controllers/settings/get-app-info-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { getAppInfoRouteOptions } from "@/schemas/routes/settings/get-app-info";

const getAppInfo = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.get("/settings/app-info", getAppInfoRouteOptions, getAppInfoController.handle);
};

export default getAppInfo;
