import { prisma } from "@/database/prisma";
import type {
	AddressOwnerType,
	AddressType,
} from "../../../../prisma/generated/prisma/client";
import type {
	AddressRepository,
	UpsertPrimaryAddressData,
} from "./addresses-repository-contract";

export const prismaAddressRepository: AddressRepository = {
	async findPrimaryByOwner(ownerType, ownerId, preferredType?: AddressType) {
		if (preferredType) {
			const typed = await prisma.address.findFirst({
				where: {
					ownerType,
					ownerId,
					isPrimary: true,
					type: preferredType,
				},
				orderBy: { updatedAt: "desc" },
			});

			if (typed) {
				return typed;
			}
		}

		return prisma.address.findFirst({
			where: {
				ownerType,
				ownerId,
				isPrimary: true,
			},
			orderBy: {
				updatedAt: "desc",
			},
		});
	},

	async findPrimaryByOwnerIds(
		ownerType: AddressOwnerType,
		ownerIds: string[],
		preferredType?: AddressType,
	) {
		if (ownerIds.length === 0) {
			return [];
		}

		const addresses = await prisma.address.findMany({
			where: {
				ownerType,
				ownerId: { in: ownerIds },
				isPrimary: true,
				...(preferredType ? { type: preferredType } : {}),
			},
			orderBy: { updatedAt: "desc" },
		});

		const byOwnerId = new Map<string, (typeof addresses)[number]>();

		for (const entry of addresses) {
			if (!byOwnerId.has(entry.ownerId)) {
				byOwnerId.set(entry.ownerId, entry);
			}
		}

		if (!preferredType) {
			const fallbackAddresses = await prisma.address.findMany({
				where: {
					ownerType,
					ownerId: {
						in: ownerIds.filter((ownerId) => !byOwnerId.has(ownerId)),
					},
					isPrimary: true,
				},
				orderBy: { updatedAt: "desc" },
			});

			for (const entry of fallbackAddresses) {
				if (!byOwnerId.has(entry.ownerId)) {
					byOwnerId.set(entry.ownerId, entry);
				}
			}
		}

		return ownerIds
			.map((ownerId) => byOwnerId.get(ownerId))
			.filter((entry): entry is (typeof addresses)[number] => Boolean(entry));
	},

	async upsertPrimary(ownerType: AddressOwnerType, ownerId, data) {
		const existing = await prisma.address.findFirst({
			where: {
				ownerType,
				ownerId,
				isPrimary: true,
				type: data.type,
			},
		});

		const payload = {
			ownerType,
			ownerId,
			type: data.type,
			isPrimary: true,
			label: data.label ?? null,
			countryCode: data.countryCode,
			postalCode: data.postalCode,
			state: data.state,
			city: data.city,
			neighborhood: data.neighborhood,
			street: data.street,
			number: data.number,
			complement: data.complement ?? null,
			reference: data.reference ?? null,
			latitude: data.latitude ?? null,
			longitude: data.longitude ?? null,
			formattedAddress: data.formattedAddress ?? null,
		};

		if (existing) {
			return prisma.address.update({
				where: { id: existing.id },
				data: payload,
			});
		}

		await prisma.address.updateMany({
			where: {
				ownerType,
				ownerId,
				isPrimary: true,
			},
			data: {
				isPrimary: false,
			},
		});

		return prisma.address.create({
			data: payload,
		});
	},
};
