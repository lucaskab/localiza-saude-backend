import { prismaAddressRepository } from "@/http/repositories/addresses/addresses-repository-implementation";
import {
	buildFormattedAddress,
	type AddressInputSchema,
} from "@/schemas/routes/addresses/address";
import { geocodingService } from "@/http/services/geocoding-service";
import type { AddressOwnerType } from "../../../../prisma/generated/prisma/client";

export const upsertPrimaryAddressUseCase = {
	async execute(
		ownerType: AddressOwnerType,
		ownerId: string,
		input: AddressInputSchema,
	) {
		const formattedAddress = buildFormattedAddress(input);
		const geocoded = await geocodingService.geocode(formattedAddress);

		return prismaAddressRepository.upsertPrimary(ownerType, ownerId, {
			...input,
			formattedAddress,
			latitude: geocoded?.latitude ?? null,
			longitude: geocoded?.longitude ?? null,
		});
	},
};
