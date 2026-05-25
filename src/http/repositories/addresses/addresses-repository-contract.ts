import type {
	address,
	AddressOwnerType,
	AddressType,
} from "../../../../prisma/generated/prisma/client";
import type { AddressInputSchema } from "@/schemas/routes/addresses/address";

export type UpsertPrimaryAddressData = AddressInputSchema & {
	latitude?: number | null;
	longitude?: number | null;
	formattedAddress?: string | null;
};

export type AddressRepository = {
	findPrimaryByOwner: (
		ownerType: AddressOwnerType,
		ownerId: string,
		preferredType?: address["type"],
	) => Promise<address | null>;
	findPrimaryByOwnerIds: (
		ownerType: AddressOwnerType,
		ownerIds: string[],
		preferredType?: address["type"],
	) => Promise<address[]>;
	upsertPrimary: (
		ownerType: AddressOwnerType,
		ownerId: string,
		data: UpsertPrimaryAddressData,
	) => Promise<address>;
};
