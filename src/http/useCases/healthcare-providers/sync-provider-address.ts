import type { AddressInputSchema } from "@/schemas/routes/addresses/address";
import { upsertPrimaryAddressUseCase } from "@/http/useCases/addresses/upsert-primary-address-use-case";

export async function syncProviderClinicAddress(
	providerId: string,
	address?: AddressInputSchema | null,
) {
	if (address === undefined) {
		return;
	}

	if (address === null) {
		return;
	}

	await upsertPrimaryAddressUseCase.execute("USER", providerId, {
		...address,
		type: address.type ?? "CLINIC",
	});
}
