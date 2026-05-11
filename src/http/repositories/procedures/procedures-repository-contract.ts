import type {
	procedure,
	procedure_checklist_item,
} from "../../../../prisma/generated/prisma/client";

export type ProcedureWithChecklist = procedure & {
	checklistItems: procedure_checklist_item[];
};

export type ProcedureChecklistItemData = {
	text: string;
	position?: number;
};

export type CreateProcedureData = {
	name: string;
	description?: string | null;
	priceInCents: number;
	durationInMinutes: number;
	healthcareProviderId: string;
	checklistItems?: ProcedureChecklistItemData[];
};

export type UpdateProcedureData = {
	name?: string;
	description?: string | null;
	priceInCents?: number;
	durationInMinutes?: number;
	checklistItems?: ProcedureChecklistItemData[];
};

export type ProcedureRepository = {
	findAll: () => Promise<ProcedureWithChecklist[]>;
	findById: (id: string) => Promise<ProcedureWithChecklist | null>;
	findByHealthcareProviderId: (
		healthcareProviderId: string,
	) => Promise<ProcedureWithChecklist[]>;
	create: (data: CreateProcedureData) => Promise<ProcedureWithChecklist>;
	update: (id: string, data: UpdateProcedureData) => Promise<ProcedureWithChecklist>;
	delete: (id: string) => Promise<void>;
};
