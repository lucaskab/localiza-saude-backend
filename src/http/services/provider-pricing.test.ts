import { describe, expect, test } from "bun:test";
import {
	canDisplayProviderPrices,
	getStartingPriceCents,
	matchesMaxPriceCentsFilter,
} from "./provider-pricing";

describe("provider-pricing", () => {
	test("returns null starting price when every procedure is zero", () => {
		expect(
			getStartingPriceCents([{ priceInCents: 0 }, { priceInCents: 0 }]),
		).toBeNull();
	});

	test("ignores zero-priced procedures when calculating starting price", () => {
		expect(
			getStartingPriceCents([
				{ priceInCents: 0 },
				{ priceInCents: 15000 },
				{ priceInCents: 25000 },
			]),
		).toBe(15000);
	});

	test("excludes providers that cannot display prices from max price filter", () => {
		expect(
			matchesMaxPriceCentsFilter(
				{
					professionalCouncil: { allowsPriceDisplay: false },
					procedures: [{ priceInCents: 10000 }],
				},
				50000,
			),
		).toBe(false);
	});

	test("excludes providers without a displayable starting price", () => {
		expect(
			matchesMaxPriceCentsFilter(
				{
					professionalCouncil: { allowsPriceDisplay: true },
					procedures: [{ priceInCents: 0 }],
				},
				50000,
			),
		).toBe(false);
	});

	test("includes providers whose starting price is within the max filter", () => {
		expect(
			matchesMaxPriceCentsFilter(
				{
					professionalCouncil: { allowsPriceDisplay: true },
					procedures: [{ priceInCents: 0 }, { priceInCents: 12000 }],
				},
				15000,
			),
		).toBe(true);
	});

	test("excludes providers whose cheapest displayable price exceeds the max filter", () => {
		expect(
			matchesMaxPriceCentsFilter(
				{
					professionalCouncil: { allowsPriceDisplay: true },
					procedures: [{ priceInCents: 20000 }, { priceInCents: 30000 }],
				},
				15000,
			),
		).toBe(false);
	});

	test("allows price display when council is missing", () => {
		expect(canDisplayProviderPrices({ professionalCouncil: null })).toBe(true);
	});
});
