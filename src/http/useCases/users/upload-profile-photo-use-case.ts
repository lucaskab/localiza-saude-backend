import { prisma } from "@/database/prisma";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import { UnauthorizedError } from "@/http/routes/_errors/unauthorized-error";
import { clinicRbac } from "@/http/services/clinic-rbac";
import { validateUserProfilePhotoFile } from "@/http/services/user-profile-photo-security";
import { storageService } from "@/http/services/storage.service";
import {
	isStoredProfilePhotoKey,
	signUserImage,
} from "@/http/useCases/users/sign-user-image-url";
import type { user } from "../../../../prisma/generated/prisma/client";

async function assertCanManageProfilePhoto(currentUser: user, userId: string) {
	if (currentUser.id === userId) {
		return;
	}

	if (currentUser.role === "ADMIN") {
		return;
	}

	const targetUser = await prisma.user.findUnique({
		where: { id: userId },
		select: { id: true, role: true },
	});

	if (!targetUser) {
		throw new BadRequestError("User not found");
	}

	if (targetUser.role === "HEALTHCARE_PROVIDER") {
		await clinicRbac.assertCanManageProvider(
			currentUser,
			targetUser.id,
			"MANAGE_PROVIDER_PROFILE",
		);
		return;
	}

	throw new UnauthorizedError("You can only update your own profile photo");
}

export const uploadProfilePhotoUseCase = {
	async execute(params: {
		userId: string;
		currentUser: user;
		buffer: Buffer;
		mimeType: string;
	}) {
		await assertCanManageProfilePhoto(params.currentUser, params.userId);

		const existingUser = await prisma.user.findUnique({
			where: { id: params.userId },
		});

		if (!existingUser) {
			throw new BadRequestError("User not found");
		}

		const photo = validateUserProfilePhotoFile({
			buffer: params.buffer,
			mimeType: params.mimeType,
		});
		const file = new File([params.buffer], photo.storageFileName, {
			type: photo.mimeType,
		});
		const uploadResult = await storageService.uploadFile({
			file,
			folder: `user-profile-photos/${params.userId}`,
			fileName: photo.storageFileName,
		});

		try {
			const previousImage = existingUser.image;
			const updatedUser = await prisma.user.update({
				where: { id: params.userId },
				data: { image: uploadResult.key },
			});

			if (isStoredProfilePhotoKey(previousImage)) {
				await storageService.deleteFile(previousImage).catch(() => undefined);
			}

			return {
				user: signUserImage(updatedUser),
				photo: {
					url: storageService.presignUrl(uploadResult.key, 3600),
					expiresInSeconds: 3600,
				},
			};
		} catch (error) {
			await storageService.deleteFile(uploadResult.key).catch(() => undefined);
			throw error;
		}
	},
};
