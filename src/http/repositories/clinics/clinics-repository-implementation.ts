import { prisma } from "@/database/prisma";
import type { ClinicType } from "../../../../prisma/generated/prisma/client";
import type {
	ClinicRepository,
	CreateClinicData,
	FindNearbyParams,
	UpdateClinicData,
} from "./clinics-repository-contract";

export const prismaClinicRepository: ClinicRepository = {
	async findAll() {
		const clinics = await prisma.clinic.findMany({
			orderBy: {
				createdAt: "desc",
			},
		});

		return clinics;
	},

	async findById(id: string) {
		const clinic = await prisma.clinic.findUnique({
			where: { id },
		});

		return clinic;
	},

	async findNearby(params: FindNearbyParams) {
		const { latitude, longitude, radiusInKm } = params;

		// Using Haversine formula to calculate distance
		// Formula: distance = 6371 * acos(cos(lat1) * cos(lat2) * cos(lon2 - lon1) + sin(lat1) * sin(lat2))
		// where 6371 is Earth's radius in kilometers

		const clinics = await prisma.$queryRaw<
			{
				id: string;
				name: string;
				phone: string;
				description: string | null;
				email: string;
				type: string;
				created_at: Date;
				updated_at: Date;
				owner_id: string;
				distance: number;
			}[]
		>`
			SELECT
				c.id,
				c.name,
				c.phone,
				c.description,
				c.email,
				c.type,
				c.created_at,
				c.updated_at,
				c.owner_id,
				(
					6371 * acos(
						cos(radians(${latitude})) * cos(radians(a.latitude)) *
						cos(radians(a.longitude) - radians(${longitude})) +
						sin(radians(${latitude})) * sin(radians(a.latitude))
					)
			) AS distance
			FROM clinics c
			INNER JOIN addresses a
				ON a.owner_type = 'CLINIC'
				AND a.owner_id = c.id
				AND a.is_primary = true
			WHERE a.latitude IS NOT NULL
			AND a.longitude IS NOT NULL
			AND (
				6371 * acos(
					cos(radians(${latitude})) * cos(radians(a.latitude)) *
					cos(radians(a.longitude) - radians(${longitude})) +
					sin(radians(${latitude})) * sin(radians(a.latitude))
				)
			) <= ${radiusInKm}
			ORDER BY distance ASC
		`;

		return clinics.map((clinic) => ({
			id: clinic.id,
			name: clinic.name,
			phone: clinic.phone,
			description: clinic.description,
			email: clinic.email,
			type: clinic.type as ClinicType,
			createdAt: clinic.created_at,
			updatedAt: clinic.updated_at,
			ownerId: clinic.owner_id,
		}));
	},

	async create(data: CreateClinicData) {
		const clinic = await prisma.clinic.create({
			data: {
				name: data.name,
				phone: data.phone,
				description: data.description,
				email: data.email,
				type: data.type,
				ownerId: data.ownerId,
			},
		});

		return clinic;
	},

	async update(id: string, data: UpdateClinicData) {
		const clinic = await prisma.clinic.update({
			where: { id },
			data: {
				...(data.name && { name: data.name }),
				...(data.phone && { phone: data.phone }),
				...(data.description !== undefined && {
					description: data.description,
				}),
				...(data.email && { email: data.email }),
				...(data.type && { type: data.type }),
			},
		});

		return clinic;
	},

	async delete(id: string) {
		await prisma.clinic.delete({
			where: { id },
		});
	},
};
