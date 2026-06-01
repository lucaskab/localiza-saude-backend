import type { SeedClient, SeedClinics, SeedUsers } from "./types";

type SeedAddress = {
	type: "HOME" | "CLINIC";
	countryCode?: string;
	postalCode: string;
	state: string;
	city: string;
	neighborhood: string;
	street: string;
	number: string;
	complement?: string;
	latitude?: number;
	longitude?: number;
	formattedAddress: string;
};

const LUCAS_CUSTOMER_ADDRESS: SeedAddress = {
	type: "HOME",
	countryCode: "DE",
	postalCode: "10117",
	state: "BE",
	city: "Berlin",
	neighborhood: "Mitte",
	street: "Friedrichstrasse",
	number: "123",
	latitude: 52.520918,
	longitude: 13.388859,
	formattedAddress: "Friedrichstrasse 123, 10117 Berlin, Germany",
};

const JULIANA_CUSTOMER_ADDRESS: SeedAddress = {
	type: "HOME",
	countryCode: "DE",
	postalCode: "10969",
	state: "BE",
	city: "Berlin",
	neighborhood: "Kreuzberg",
	street: "Prinzenstrasse",
	number: "45",
	latitude: 52.50368,
	longitude: 13.40512,
	formattedAddress: "Prinzenstrasse 45, 10969 Berlin, Germany",
};

const PROVIDER_ADDRESSES: Record<string, SeedAddress> = {
	cmnuu7to60006r1scsref3kpv: {
		type: "CLINIC",
		countryCode: "DE",
		postalCode: "10117",
		state: "BE",
		city: "Berlin",
		neighborhood: "Mitte",
		street: "Leipziger Strasse",
		number: "40",
		latitude: 52.510741,
		longitude: 13.392416,
		formattedAddress: "Leipziger Strasse 40, 10117 Berlin, Germany",
	},
	seed_provider_ana_souza: {
		type: "CLINIC",
		countryCode: "DE",
		postalCode: "10178",
		state: "BE",
		city: "Berlin",
		neighborhood: "Mitte",
		street: "Rochstrasse",
		number: "7",
		latitude: 52.524563,
		longitude: 13.41345,
		formattedAddress: "Rochstrasse 7, 10178 Berlin, Germany",
	},
	seed_provider_carlos_lima: {
		type: "CLINIC",
		countryCode: "DE",
		postalCode: "10997",
		state: "BE",
		city: "Berlin",
		neighborhood: "Kreuzberg",
		street: "Skalitzer Strasse",
		number: "134",
		latitude: 52.498633,
		longitude: 13.431645,
		formattedAddress: "Skalitzer Strasse 134, 10997 Berlin, Germany",
	},
	seed_provider_marina_alves: {
		type: "CLINIC",
		countryCode: "DE",
		postalCode: "10969",
		state: "BE",
		city: "Berlin",
		neighborhood: "Kreuzberg",
		street: "Lindenstrasse",
		number: "34",
		latitude: 52.503104,
		longitude: 13.390707,
		formattedAddress: "Lindenstrasse 34, 10969 Berlin, Germany",
	},
	seed_provider_rafael_mendes: {
		type: "CLINIC",
		countryCode: "DE",
		postalCode: "10437",
		state: "BE",
		city: "Berlin",
		neighborhood: "Prenzlauer Berg",
		street: "Schonhauser Allee",
		number: "92",
		latitude: 52.547251,
		longitude: 13.413404,
		formattedAddress: "Schonhauser Allee 92, 10437 Berlin, Germany",
	},
	seed_provider_beatriz_nunes: {
		type: "CLINIC",
		countryCode: "DE",
		postalCode: "10623",
		state: "BE",
		city: "Berlin",
		neighborhood: "Charlottenburg",
		street: "Kantstrasse",
		number: "110",
		latitude: 52.506043,
		longitude: 13.325728,
		formattedAddress: "Kantstrasse 110, 10623 Berlin, Germany",
	},
	seed_provider_pedro_rocha: {
		type: "CLINIC",
		countryCode: "DE",
		postalCode: "10719",
		state: "BE",
		city: "Berlin",
		neighborhood: "Charlottenburg",
		street: "Kurfurstendamm",
		number: "57",
		latitude: 52.503198,
		longitude: 13.329991,
		formattedAddress: "Kurfurstendamm 57, 10719 Berlin, Germany",
	},
};

async function upsertPrimaryAddress(
	prisma: SeedClient,
	ownerType: "USER" | "CLINIC",
	ownerId: string,
	address: SeedAddress,
) {
	await prisma.address.deleteMany({
		where: { ownerType, ownerId },
	});

	await prisma.address.create({
		data: {
			ownerType,
			ownerId,
			type: address.type,
			isPrimary: true,
			countryCode: address.countryCode ?? "DE",
			postalCode: address.postalCode,
			state: address.state,
			city: address.city,
			neighborhood: address.neighborhood,
			street: address.street,
			number: address.number,
			complement: address.complement ?? null,
			latitude: address.latitude ?? null,
			longitude: address.longitude ?? null,
			formattedAddress: address.formattedAddress,
		},
	});
}

export async function seedUserAddresses(prisma: SeedClient, users: SeedUsers) {
	console.log("📍 Seeding user addresses...");

	await upsertPrimaryAddress(
		prisma,
		"USER",
		users.customers.lucas.id,
		LUCAS_CUSTOMER_ADDRESS,
	);
	await upsertPrimaryAddress(
		prisma,
		"USER",
		users.customers.juliana.id,
		JULIANA_CUSTOMER_ADDRESS,
	);

	for (const provider of Object.values(users.providers)) {
		const address = PROVIDER_ADDRESSES[provider.id];
		if (address) {
			await upsertPrimaryAddress(prisma, "USER", provider.id, address);
		}
	}

	console.log("✅ User addresses seeded");
}

const CLINIC_ADDRESSES_BY_EMAIL: Record<string, SeedAddress> = {
	"lucas.furini.clinica@localizasaude.seed":
		PROVIDER_ADDRESSES.cmnuu7to60006r1scsref3kpv,
	"paulista@localizasaude.seed": PROVIDER_ADDRESSES.seed_provider_ana_souza,
	"pinheiros@localizasaude.seed": PROVIDER_ADDRESSES.seed_provider_carlos_lima,
	"copacabana@localizasaude.seed": PROVIDER_ADDRESSES.seed_provider_rafael_mendes,
	"sorriso@localizasaude.seed": PROVIDER_ADDRESSES.seed_provider_pedro_rocha,
};

export async function seedClinicAddresses(prisma: SeedClient, clinics: SeedClinics) {
	console.log("📍 Seeding clinic addresses...");

	for (const clinic of Object.values(clinics)) {
		const address = CLINIC_ADDRESSES_BY_EMAIL[clinic.email];
		if (address) {
			await upsertPrimaryAddress(prisma, "CLINIC", clinic.id, {
				...address,
				type: "CLINIC",
			});
		}
	}

	console.log("✅ Clinic addresses seeded");
}

export function getCustomerFormattedAddress(customerId: string) {
	if (customerId === "cmnuu7gqu0001r1sc039r0a70") {
		return LUCAS_CUSTOMER_ADDRESS.formattedAddress;
	}

	return JULIANA_CUSTOMER_ADDRESS.formattedAddress;
}
