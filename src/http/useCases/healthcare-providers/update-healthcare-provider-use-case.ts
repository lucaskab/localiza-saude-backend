import type { UpdateHealthcareProviderBodySchema } from "@/schemas/routes/healthcare-providers/update-healthcare-provider";
import type { UpdateHealthcareProviderData } from "@/http/repositories/healthcare-providers/healthcare-providers-repository-contract";
import { prismaHealthcareProviderRepository } from "@/http/repositories/healthcare-providers/healthcare-providers-repository-implementation";
import { BadRequestError } from "@/http/routes/_errors/bad-request-error";
import { UnauthorizedError } from "@/http/routes/_errors/unauthorized-error";
import { clinicRbac } from "@/http/services/clinic-rbac";
import { recurringAppointmentsService } from "@/http/services/recurring-appointments";
import { attachPrimaryAddressToOwner } from "@/http/useCases/addresses/attach-primary-addresses";
import { signClinicPhotoUrls } from "@/http/useCases/healthcare-providers/sign-clinic-photo-urls";
import { syncProviderClinicAddress } from "./sync-provider-address";
import type { user } from "../../../../prisma/generated/prisma/client";

function removeStaffRestrictedFields(
	data: Omit<UpdateHealthcareProviderData, "address">,
) {
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
		body: UpdateHealthcareProviderBodySchema,
		currentUser: user,
	) {
		const { address, ...data } = body;
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

		const healthcareProvider = await prismaHealthcareProviderRepository.update(
			id,
			editableData,
		);

		await syncProviderClinicAddress(id, address);

		if (data.bookingAvailabilityDays !== undefined) {
			await recurringAppointmentsService.trimProviderRecurringAppointmentsToWindow(
				id,
			);
		}

		const withAddress = await attachPrimaryAddressToOwner(
			"USER",
			signClinicPhotoUrls(healthcareProvider),
			"CLINIC",
		);

		return { healthcareProvider: withAddress };
	},
};
