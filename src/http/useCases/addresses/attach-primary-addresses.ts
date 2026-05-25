import { prismaAddressRepository } from "@/http/repositories/addresses/addresses-repository-implementation";
import { addressPresenter } from "@/http/presenters/address-presenter";
import type { address, AddressOwnerType } from "../../../../prisma/generated/prisma/client";

export type WithPrimaryAddress<T> = T & {
	primaryAddress: ReturnType<typeof addressPresenter.toHTTP> | null;
};

export async function attachPrimaryAddressToOwner<T extends { id: string }>(
	ownerType: AddressOwnerType,
	item: T,
	preferredType?: address["type"],
): Promise<WithPrimaryAddress<T>> {
	const primaryAddress = await prismaAddressRepository.findPrimaryByOwner(
		ownerType,
		item.id,
		preferredType,
	);

	return {
		...item,
		primaryAddress: primaryAddress
			? addressPresenter.toHTTP(primaryAddress)
			: null,
	};
}

export async function attachPrimaryAddressesToOwners<T extends { id: string }>(
	ownerType: AddressOwnerType,
	items: T[],
	preferredType?: address["type"],
): Promise<Array<WithPrimaryAddress<T>>> {
	if (items.length === 0) {
		return [];
	}

	const addresses = await prismaAddressRepository.findPrimaryByOwnerIds(
		ownerType,
		items.map((item) => item.id),
		preferredType,
	);
	const addressByOwnerId = new Map(
		addresses.map((entry) => [entry.ownerId, entry]),
	);

	return items.map((item) => {
		const primaryAddress = addressByOwnerId.get(item.id);

		return {
			...item,
			primaryAddress: primaryAddress
				? addressPresenter.toHTTP(primaryAddress)
				: null,
		};
	});
}
