import { env } from "@/env";

export type GeocodedAddress = {
	latitude: number;
	longitude: number;
	neighborhood: string | null;
	city: string | null;
	state: string | null;
};

type GoogleGeocodeResponse = {
	results?: Array<{
		geometry?: {
			location?: {
				lat?: number;
				lng?: number;
			};
		};
		address_components?: Array<{
			long_name: string;
			short_name: string;
			types: string[];
		}>;
	}>;
	status?: string;
};

type NominatimGeocodeResponse = Array<{
	lat?: string;
	lon?: string;
	address?: {
		suburb?: string;
		neighbourhood?: string;
		city_district?: string;
		city?: string;
		town?: string;
		village?: string;
		state?: string;
	};
}>;

function readGoogleComponent(
	components: NonNullable<GoogleGeocodeResponse["results"]>[number]["address_components"],
	types: string[],
) {
	return (
		components?.find((component) =>
			types.some((type) => component.types.includes(type)),
		)?.long_name ?? null
	);
}

function normalizeLocation(location: GeocodedAddress): GeocodedAddress | null {
	if (
		Number.isNaN(location.latitude) ||
		Number.isNaN(location.longitude) ||
		location.latitude < -90 ||
		location.latitude > 90 ||
		location.longitude < -180 ||
		location.longitude > 180
	) {
		return null;
	}

	return location;
}

async function geocodeWithGoogle(address: string) {
	const apiKey = env.GOOGLE_GEOCODING_API_KEY ?? env.GOOGLE_MAPS_API_KEY;

	if (!apiKey) {
		return null;
	}

	const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
	url.searchParams.set("address", address);
	url.searchParams.set("region", "br");
	url.searchParams.set("key", apiKey);

	const response = await fetch(url);

	if (!response.ok) {
		return null;
	}

	const data = (await response.json()) as GoogleGeocodeResponse;
	const result = data.results?.[0];
	const latitude = result?.geometry?.location?.lat;
	const longitude = result?.geometry?.location?.lng;

	if (
		!result ||
		typeof latitude !== "number" ||
		typeof longitude !== "number"
	) {
		return null;
	}

	return normalizeLocation({
		latitude,
		longitude,
		neighborhood: readGoogleComponent(result.address_components, [
			"sublocality_level_1",
			"sublocality",
			"neighborhood",
		]),
		city: readGoogleComponent(result.address_components, [
			"administrative_area_level_2",
			"locality",
		]),
		state: readGoogleComponent(result.address_components, [
			"administrative_area_level_1",
		]),
	});
}

async function geocodeWithNominatim(address: string) {
	const url = new URL("https://nominatim.openstreetmap.org/search");
	url.searchParams.set("q", `${address}, Brasil`);
	url.searchParams.set("format", "jsonv2");
	url.searchParams.set("addressdetails", "1");
	url.searchParams.set("limit", "1");
	url.searchParams.set("countrycodes", "br");

	const response = await fetch(url, {
		headers: {
			"User-Agent": "LocalizaSaude/1.0 (provider-location-search)",
		},
	});

	if (!response.ok) {
		return null;
	}

	const data = (await response.json()) as NominatimGeocodeResponse;
	const result = data[0];
	const latitude = Number(result?.lat);
	const longitude = Number(result?.lon);

	return normalizeLocation({
		latitude,
		longitude,
		neighborhood:
			result?.address?.suburb ??
			result?.address?.neighbourhood ??
			result?.address?.city_district ??
			null,
		city:
			result?.address?.city ??
			result?.address?.town ??
			result?.address?.village ??
			null,
		state: result?.address?.state ?? null,
	});
}

export const geocodingService = {
	async geocode(address?: string | null) {
		const normalizedAddress = address?.trim();

		if (!normalizedAddress) {
			return null;
		}

		return (
			(await geocodeWithGoogle(normalizedAddress).catch(() => null)) ??
			(await geocodeWithNominatim(normalizedAddress).catch(() => null))
		);
	},
};
