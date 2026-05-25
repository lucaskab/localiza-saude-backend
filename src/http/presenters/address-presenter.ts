import type { address } from "../../../prisma/generated/prisma/client";

export const addressPresenter = {
	toHTTP(addressRecord: address) {
		return {
			id: addressRecord.id,
			ownerType: addressRecord.ownerType,
			ownerId: addressRecord.ownerId,
			type: addressRecord.type,
			isPrimary: addressRecord.isPrimary,
			label: addressRecord.label,
			countryCode: addressRecord.countryCode,
			postalCode: addressRecord.postalCode,
			state: addressRecord.state,
			city: addressRecord.city,
			neighborhood: addressRecord.neighborhood,
			street: addressRecord.street,
			number: addressRecord.number,
			complement: addressRecord.complement,
			reference: addressRecord.reference,
			latitude: addressRecord.latitude,
			longitude: addressRecord.longitude,
			formattedAddress: addressRecord.formattedAddress,
			createdAt: addressRecord.createdAt,
			updatedAt: addressRecord.updatedAt,
		};
	},
};
