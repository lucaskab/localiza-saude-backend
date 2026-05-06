import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { getLicenseDocumentUrlController } from "@/http/controllers/healthcare-providers/get-license-document-url-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { getLicenseDocumentUrlRouteOptions } from "@/schemas/routes/healthcare-providers/license-document";

const getLicenseDocumentUrl = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.get(
			"/healthcare-providers/:id/license-document",
			getLicenseDocumentUrlRouteOptions,
			getLicenseDocumentUrlController.handle,
		);
};

export default getLicenseDocumentUrl;
