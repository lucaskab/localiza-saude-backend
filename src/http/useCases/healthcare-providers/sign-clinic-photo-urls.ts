import { storageService } from "@/http/services/storage.service";
import { signUserImageUrl } from "@/http/useCases/users/sign-user-image-url";

export function signClinicPhotoUrls<
	T extends { clinicPhotos: string[]; image?: string | null },
>(provider: T): T {
	return {
		...provider,
		image: signUserImageUrl(provider.image),
		clinicPhotos: provider.clinicPhotos.map((photo) =>
			photo.startsWith("http") ? photo : storageService.presignUrl(photo, 3600),
		),
	};
}
