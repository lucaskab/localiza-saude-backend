import { storageService } from "@/http/services/storage.service";

export function signClinicPhotoUrls<T extends { clinicPhotos: string[] }>(
	provider: T,
): T {
	return {
		...provider,
		clinicPhotos: provider.clinicPhotos.map((photo) =>
			photo.startsWith("http") ? photo : storageService.presignUrl(photo, 3600),
		),
	};
}
