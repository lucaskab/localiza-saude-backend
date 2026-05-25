import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { uploadProfilePhotoController } from "@/http/controllers/users/upload-profile-photo-controller";
import { authMiddleware } from "@/http/middlewares/auth";
import { uploadProfilePhotoRouteOptions } from "@/schemas/routes/users/profile-photo";

const uploadProfilePhoto = (app: FastifyInstance) => {
	app
		.withTypeProvider<ZodTypeProvider>()
		.register(authMiddleware)
		.post(
			"/users/:id/profile-photo",
			uploadProfilePhotoRouteOptions,
			uploadProfilePhotoController.handle,
		);
};

export default uploadProfilePhoto;
