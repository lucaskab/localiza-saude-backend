import type { Prisma } from "../../../prisma/generated/prisma/client";

type ProcedureWithPrice = {
	priceInCents: number;
};

type ProviderWithCouncil = {
	professionalCouncil?: { allowsPriceDisplay: boolean } | null;
};

export function canDisplayProviderPrices(
	provider: ProviderWithCouncil | null | undefined,
) {
	return provider?.professionalCouncil?.allowsPriceDisplay !== false;
}

export function getPricedProcedureAmounts(procedures: ProcedureWithPrice[]) {
	return procedures
		.map((procedure) => procedure.priceInCents)
		.filter((priceInCents) => priceInCents > 0);
}

export function getStartingPriceCents(procedures: ProcedureWithPrice[]) {
	const pricedAmounts = getPricedProcedureAmounts(procedures);

	if (pricedAmounts.length === 0) {
		return null;
	}

	return Math.min(...pricedAmounts);
}

export function matchesMaxPriceCentsFilter(
	provider: ProviderWithCouncil & { procedures: ProcedureWithPrice[] },
	maxPriceCents: number,
) {
	if (!canDisplayProviderPrices(provider)) {
		return false;
	}

	const startingPriceCents = getStartingPriceCents(provider.procedures);

	if (startingPriceCents === null) {
		return false;
	}

	return startingPriceCents <= maxPriceCents;
}

export function createMaxPriceFilterWhere(
	maxPriceCents: number,
): Prisma.userWhereInput {
	return {
		AND: [
			{
				OR: [
					{ professionalCouncilId: null },
					{ professionalCouncil: { allowsPriceDisplay: true } },
				],
			},
			{
				procedures: {
					some: {
						priceInCents: {
							gt: 0,
							lte: maxPriceCents,
						},
					},
				},
			},
		],
	};
}
