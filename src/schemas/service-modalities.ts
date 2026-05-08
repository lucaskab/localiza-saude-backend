import { z } from "zod";

export const SERVICE_MODALITIES = {
	IN_PERSON: "IN_PERSON",
	ONLINE: "ONLINE",
	HOME_CARE: "HOME_CARE",
} as const;

export const SERVICE_MODALITY_VALUES = [
	SERVICE_MODALITIES.IN_PERSON,
	SERVICE_MODALITIES.ONLINE,
	SERVICE_MODALITIES.HOME_CARE,
] as const;

export const serviceModalitySchema = z.enum(SERVICE_MODALITY_VALUES);

export type ServiceModality = z.infer<typeof serviceModalitySchema>;

export function isServiceModality(value: string): value is ServiceModality {
	return SERVICE_MODALITY_VALUES.includes(value as ServiceModality);
}
