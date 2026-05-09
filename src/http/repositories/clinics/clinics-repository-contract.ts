import type {
	ClinicType,
	clinic,
} from "../../../../prisma/generated/prisma/client";

export type CreateClinicData = {
	name: string;
	phone: string;
	description?: string | null;
	email: string;
	type: ClinicType;
	address?: string | null;
	latitude?: number | null;
	longitude?: number | null;
	ownerId: string;
};

export type UpdateClinicData = {
	name?: string;
	phone?: string;
	description?: string | null;
	email?: string;
	type?: ClinicType;
	address?: string | null;
	latitude?: number | null;
	longitude?: number | null;
};

export type FindNearbyParams = {
	latitude: number;
	longitude: number;
	radiusInKm: number;
};

export type ClinicRepository = {
	findAll: () => Promise<clinic[]>;
	findById: (id: string) => Promise<clinic | null>;
	findNearby: (params: FindNearbyParams) => Promise<clinic[]>;
	create: (data: CreateClinicData) => Promise<clinic>;
	update: (id: string, data: UpdateClinicData) => Promise<clinic>;
	delete: (id: string) => Promise<void>;
};
