import { prisma } from "@/database/prisma";
import type { Prisma } from "../../../../prisma/generated/prisma/client";
import type { FindAllHealthcareProviderFilters } from "../healthcare-providers/healthcare-providers-repository-contract";
function calculateCoordinateBoundsForFilters(params: {
	latitude: number;
	longitude: number;
	radiusInKm: number;
}) {
	const latitudeDelta = params.radiusInKm / 111;
	const latitudeRadians = (params.latitude * Math.PI) / 180;
	const longitudeDelta =
		params.radiusInKm / (111 * Math.max(Math.cos(latitudeRadians), 0.01));

	return {
		minLatitude: Math.max(params.latitude - latitudeDelta, -90),
		maxLatitude: Math.min(params.latitude + latitudeDelta, 90),
		minLongitude: Math.max(params.longitude - longitudeDelta, -180),
		maxLongitude: Math.min(params.longitude + longitudeDelta, 180),
	};
}

async function findOwnerIdsMatchingAddressSearch(search: string) {
	const matches = await prisma.address.findMany({
		where: {
			ownerType: "USER",
			OR: [
				{ formattedAddress: { contains: search, mode: "insensitive" } },
				{ street: { contains: search, mode: "insensitive" } },
				{ neighborhood: { contains: search, mode: "insensitive" } },
				{ city: { contains: search, mode: "insensitive" } },
				{ postalCode: { contains: search, mode: "insensitive" } },
			],
		},
		select: { ownerId: true },
	});

	return Array.from(new Set(matches.map((match) => match.ownerId)));
}

async function findOwnerIdsMatchingAddressLocation(
	filters: FindAllHealthcareProviderFilters,
) {
	const conditions: Prisma.addressWhereInput[] = [];

	if (filters.city?.trim()) {
		conditions.push({
			city: { contains: filters.city.trim(), mode: "insensitive" },
		});
	}

	if (filters.neighborhood?.trim()) {
		conditions.push({
			neighborhood: {
				contains: filters.neighborhood.trim(),
				mode: "insensitive",
			},
		});
	}

	if (
		typeof filters.latitude === "number" &&
		typeof filters.longitude === "number"
	) {
		const bounds = calculateCoordinateBoundsForFilters({
			latitude: filters.latitude,
			longitude: filters.longitude,
			radiusInKm: filters.radiusInKm ?? 25,
		});

		conditions.push({
			latitude: {
				gte: bounds.minLatitude,
				lte: bounds.maxLatitude,
			},
			longitude: {
				gte: bounds.minLongitude,
				lte: bounds.maxLongitude,
			},
		});
	}

	if (conditions.length === 0) {
		return null;
	}

	const matches = await prisma.address.findMany({
		where: {
			ownerType: "USER",
			isPrimary: true,
			AND: conditions,
		},
		select: { ownerId: true },
	});

	return Array.from(new Set(matches.map((match) => match.ownerId)));
}

export async function findHealthcareProviderIdsForAddressFilters(
	filters?: FindAllHealthcareProviderFilters,
) {
	if (!filters) {
		return null;
	}

	return findOwnerIdsMatchingAddressLocation(filters);
}

export async function augmentHealthcareProviderSearchWhere(
	filters: FindAllHealthcareProviderFilters | undefined,
	where?: Prisma.userWhereInput,
): Promise<Prisma.userWhereInput | undefined> {
	const search = filters?.search?.trim();
	const addressOwnerIds = search
		? await findOwnerIdsMatchingAddressSearch(search)
		: [];
	const locationOwnerIds = filters
		? await findOwnerIdsMatchingAddressLocation(filters)
		: null;

	const extraConditions: Prisma.userWhereInput[] = [];

	if (search && addressOwnerIds.length > 0) {
		extraConditions.push({
			OR: [
				{
					displayName: { contains: search, mode: "insensitive" },
				},
				{ specialty: { contains: search, mode: "insensitive" } },
				{
					professionalCategory: {
						contains: search,
						mode: "insensitive",
					},
				},
				{ bio: { contains: search, mode: "insensitive" } },
				{ approach: { contains: search, mode: "insensitive" } },
				{ name: { contains: search, mode: "insensitive" } },
				{ id: { in: addressOwnerIds } },
			],
		});
	} else if (search) {
		extraConditions.push({
			OR: [
				{ displayName: { contains: search, mode: "insensitive" } },
				{ specialty: { contains: search, mode: "insensitive" } },
				{
					professionalCategory: {
						contains: search,
						mode: "insensitive",
					},
				},
				{ bio: { contains: search, mode: "insensitive" } },
				{ approach: { contains: search, mode: "insensitive" } },
				{ name: { contains: search, mode: "insensitive" } },
			],
		});
	}

	if (locationOwnerIds) {
		extraConditions.push({
			id: { in: locationOwnerIds.length > 0 ? locationOwnerIds : ["__none__"] },
		});
	}

	if (extraConditions.length === 0) {
		return where;
	}

	return where
		? { AND: [where, ...extraConditions] }
		: { AND: extraConditions };
}
