import { storageService } from "@/http/services/storage.service";

export function signUserImageUrl(image: string | null | undefined) {
	if (!image) {
		return null;
	}

	if (image.startsWith("http")) {
		return image;
	}

	return storageService.presignUrl(image, 3600);
}

export function signUserImage<T extends { image?: string | null }>(user: T): T {
	return {
		...user,
		image: signUserImageUrl(user.image),
	};
}

export function isStoredProfilePhotoKey(
	image: string | null | undefined,
): image is string {
	return Boolean(image && !image.startsWith("http"));
}
