import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { uploadLicenseDocumentController } from "@/http/controllers/healthcare-providers/upload-license-document-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { uploadLicenseDocumentRouteOptions } from "@/schemas/routes/healthcare-providers/license-document";

const uploadLicenseDocument = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.post(
			"/healthcare-providers/:id/license-document",
			uploadLicenseDocumentRouteOptions,
			uploadLicenseDocumentController.handle,
		);
};

export default uploadLicenseDocument;
