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
				latitude: number;
				longitude: number;
				created_at: Date;
				updated_at: Date;
				owner_id: string;
				distance: number;
			}[]
		>`
			SELECT
				id,
				name,
				phone,
				description,
				email,
				type,
				latitude,
				longitude,
				created_at,
				updated_at,
				owner_id,
				(
					6371 * acos(
						cos(radians(${latitude})) * cos(radians(latitude)) *
						cos(radians(longitude) - radians(${longitude})) +
						sin(radians(${latitude})) * sin(radians(latitude))
					)
				) AS distance
			FROM clinics
			WHERE (
				6371 * acos(
					cos(radians(${latitude})) * cos(radians(latitude)) *
					cos(radians(longitude) - radians(${longitude})) +
					sin(radians(${latitude})) * sin(radians(latitude))
				)
			) <= ${radiusInKm}
			ORDER BY distance ASC
		`;

		// Map raw results to clinic type
		return clinics.map((clinic) => ({
			id: clinic.id,
			name: clinic.name,
			phone: clinic.phone,
			description: clinic.description,
			email: clinic.email,
			type: clinic.type as ClinicType,
			latitude: clinic.latitude,
			longitude: clinic.longitude,
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
				latitude: data.latitude,
				longitude: data.longitude,
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
				...(data.latitude !== undefined && { latitude: data.latitude }),
				...(data.longitude !== undefined && { longitude: data.longitude }),
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
