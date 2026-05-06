import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { uploadClinicPhotoController } from "@/http/controllers/healthcare-providers/upload-clinic-photo-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { uploadClinicPhotoRouteOptions } from "@/schemas/routes/healthcare-providers/clinic-photo";

const uploadClinicPhoto = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.post(
			"/healthcare-providers/:id/clinic-photos",
			uploadClinicPhotoRouteOptions,
			uploadClinicPhotoController.handle,
		);
};

export default uploadClinicPhoto;
