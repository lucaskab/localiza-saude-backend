import type {
	HealthcareProviderWithRelations,
	UpdateHealthcareProviderData,
} from "@/http/repositories/healthcare-providers/healthcare-providers-repository-contract";
import { prismaHealthcareProviderRepository } from "@/http/repositories/healthcare-providers/healthcare-providers-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import { UnauthorizedError } from "@/http/routes/_errors/unauthorized-error";
import { clinicRbac } from "@/http/services/clinic-rbac";
import { geocodingService } from "@/http/services/geocoding-service";
import { recurringAppointmentsService } from "@/http/services/recurring-appointments";
import { signClinicPhotoUrls } from "@/http/useCases/healthcare-providers/sign-clinic-photo-urls";
import type { user } from "../../../../prisma/generated/prisma/client";

function removeStaffRestrictedFields(data: UpdateHealthcareProviderData) {
	const sanitized = { ...data };

	delete sanitized.professionalCategory;
	delete sanitized.professionalId;
	delete sanitized.professionalCouncilId;
	delete sanitized.licenseState;
	delete sanitized.licenseDocumentKey;
	delete sanitized.licenseDocumentFileName;
	delete sanitized.licenseDocumentMimeType;
	delete sanitized.licenseDocumentSize;
	delete sanitized.licenseDocumentSha256;
	delete sanitized.licenseDocumentUploadedAt;
	delete sanitized.verificationStatus;
	delete sanitized.verificationRejectionReason;
	delete sanitized.verifiedAt;
	delete sanitized.verifiedByUserId;
	delete sanitized.termsAcceptedAt;
	delete sanitized.lgpdConsentAt;
	delete sanitized.professionalResponsibilityAcceptedAt;

	return sanitized;
}

export const updateHealthcareProviderUseCase = {
	async execute(
		id: string,
		data: UpdateHealthcareProviderData,
		currentUser: user,
	): Promise<{ healthcareProvider: HealthcareProviderWithRelations }> {
		const existingProvider =
			await prismaHealthcareProviderRepository.findById(id);

		if (!existingProvider) {
			throw new BadRequestError("Healthcare provider not found");
		}

		const isSelfUpdate = existingProvider.id === currentUser.id;

		if (!isSelfUpdate) {
			await clinicRbac.assertCanManageProvider(
				currentUser,
				id,
				"MANAGE_PROVIDER_PROFILE",
			);
		} else if (
			currentUser.role !== "HEALTHCARE_PROVIDER" &&
			currentUser.role !== "ADMIN"
		) {
			throw new UnauthorizedError(
				"You can only update healthcare provider profiles you manage",
			);
		}

		const editableData =
			currentUser.role === "ADMIN" || isSelfUpdate
				? data
				: removeStaffRestrictedFields(data);
		const dataWithLocation = { ...editableData };

		if (editableData.clinicAddress !== undefined) {
			if (!editableData.clinicAddress?.trim()) {
				dataWithLocation.clinicLatitude = null;
				dataWithLocation.clinicLongitude = null;
				dataWithLocation.clinicNeighborhood = null;
				dataWithLocation.clinicCity = null;
				dataWithLocation.clinicState = null;
			} else if (
				editableData.clinicLatitude === undefined ||
				editableData.clinicLongitude === undefined
			) {
				const location = await geocodingService.geocode(
					editableData.clinicAddress,
				);

				dataWithLocation.clinicLatitude = location?.latitude ?? null;
				dataWithLocation.clinicLongitude = location?.longitude ?? null;
				dataWithLocation.clinicNeighborhood =
					editableData.clinicNeighborhood ?? location?.neighborhood ?? null;
				dataWithLocation.clinicCity =
					editableData.clinicCity ?? location?.city ?? null;
				dataWithLocation.clinicState =
					editableData.clinicState ?? location?.state ?? null;
			}
		}

		const healthcareProvider = await prismaHealthcareProviderRepository.update(
			id,
			dataWithLocation,
		);

		if (data.bookingAvailabilityDays !== undefined) {
			await recurringAppointmentsService.trimProviderRecurringAppointmentsToWindow(
				id,
			);
		}

		return { healthcareProvider: signClinicPhotoUrls(healthcareProvider) };
	},
};
