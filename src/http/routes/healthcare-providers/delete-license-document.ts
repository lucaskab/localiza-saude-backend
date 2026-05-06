import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { deleteLicenseDocumentController } from "@/http/controllers/healthcare-providers/delete-license-document-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { deleteLicenseDocumentRouteOptions } from "@/schemas/routes/healthcare-providers/license-document";

const deleteLicenseDocument = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.delete(
			"/healthcare-providers/:id/license-document",
			deleteLicenseDocumentRouteOptions,
			deleteLicenseDocumentController.handle,
		);
};

export default deleteLicenseDocument;
