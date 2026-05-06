import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { deleteClinicPhotoController } from "@/http/controllers/healthcare-providers/delete-clinic-photo-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { deleteClinicPhotoRouteOptions } from "@/schemas/routes/healthcare-providers/clinic-photo";

const deleteClinicPhoto = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.delete(
			"/healthcare-providers/:id/clinic-photos",
			deleteClinicPhotoRouteOptions,
			deleteClinicPhotoController.handle,
		);
};

export default deleteClinicPhoto;
