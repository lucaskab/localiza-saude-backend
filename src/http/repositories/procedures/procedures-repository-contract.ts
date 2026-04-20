import type { procedure } from "../../../../prisma/generated/prisma/client";

export type CreateProcedureData = {
	name: string;
	description?: string | null;
	priceInCents: number;
	durationInMinutes: number;
	healthcareProviderId: string;
};

export type UpdateProcedureData = {
	name?: string;
	description?: string | null;
	priceInCents?: number;
	durationInMinutes?: number;
};

export type ProcedureRepository = {
	findAll: () => Promise<procedure[]>;
	findById: (id: string) => Promise<procedure | null>;
	findByHealthcareProviderId: (
		healthcareProviderId: string,
	) => Promise<procedure[]>;
	create: (data: CreateProcedureData) => Promise<procedure>;
	update: (id: string, data: UpdateProcedureData) => Promise<procedure>;
	delete: (id: string) => Promise<void>;
};
