import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { providerVerificationsController } from "@/http/controllers/admin/provider-verifications-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import {
	approveProviderVerificationRouteOptions,
	getAdminProviderVerificationRouteOptions,
	getAdminProviderVerificationsRouteOptions,
	getProviderVerificationDocumentRouteOptions,
	rejectProviderVerificationRouteOptions,
} from "@/schemas/routes/admin/provider-verifications";

const providerVerifications = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.get(
			"/admin/provider-verifications",
			getAdminProviderVerificationsRouteOptions,
			providerVerificationsController.list,
		)
		.get(
			"/admin/provider-verifications/:id",
			getAdminProviderVerificationRouteOptions,
			providerVerificationsController.get,
		)
		.post(
			"/admin/provider-verifications/:id/approve",
			approveProviderVerificationRouteOptions,
			providerVerificationsController.approve,
		)
		.post(
			"/admin/provider-verifications/:id/reject",
			rejectProviderVerificationRouteOptions,
			providerVerificationsController.reject,
		)
		.get(
			"/admin/provider-verifications/:id/license-document",
			getProviderVerificationDocumentRouteOptions,
			providerVerificationsController.getDocument,
		);
};

export default providerVerifications;
