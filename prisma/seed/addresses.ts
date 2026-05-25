import type { SeedClient, SeedClinics, SeedUsers } from "./types";

type SeedAddress = {
	type: "HOME" | "CLINIC";
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
	postalCode: "01305-100",
	state: "SP",
	city: "São Paulo",
	neighborhood: "Consolação",
	street: "Rua Augusta",
	number: "1200",
	formattedAddress: "Rua Augusta, 1200 - Consolação, São Paulo - SP",
};

const JULIANA_CUSTOMER_ADDRESS: SeedAddress = {
	type: "HOME",
	postalCode: "01310-100",
	state: "SP",
	city: "São Paulo",
	neighborhood: "Bela Vista",
	street: "Av. Paulista",
	number: "900",
	formattedAddress: "Av. Paulista, 900 - Bela Vista, São Paulo - SP",
};

const PROVIDER_ADDRESSES: Record<string, SeedAddress> = {
	cmnuu7to60006r1scsref3kpv: {
		type: "CLINIC",
		postalCode: "01310-100",
		state: "SP",
		city: "São Paulo",
		neighborhood: "Bela Vista",
		street: "Av. Paulista",
		number: "900",
		latitude: -23.564186,
		longitude: -46.652741,
		formattedAddress:
			"Av. Paulista, 900 - Bela Vista, São Paulo - SP, 01310-100",
	},
	seed_provider_ana_souza: {
		type: "CLINIC",
		postalCode: "01310-200",
		state: "SP",
		city: "São Paulo",
		neighborhood: "Bela Vista",
		street: "Av. Paulista",
		number: "1578",
		latitude: -23.561684,
		longitude: -46.655981,
		formattedAddress:
			"Av. Paulista, 1578 - Bela Vista, São Paulo - SP, 01310-200",
	},
	seed_provider_carlos_lima: {
		type: "CLINIC",
		postalCode: "05409-011",
		state: "SP",
		city: "São Paulo",
		neighborhood: "Pinheiros",
		street: "Rua Oscar Freire",
		number: "2250",
		latitude: -23.561321,
		longitude: -46.681412,
		formattedAddress:
			"Rua Oscar Freire, 2250 - Pinheiros, São Paulo - SP, 05409-011",
	},
	seed_provider_marina_alves: {
		type: "CLINIC",
		postalCode: "05409-011",
		state: "SP",
		city: "São Paulo",
		neighborhood: "Pinheiros",
		street: "Rua Oscar Freire",
		number: "2250",
		latitude: -23.561321,
		longitude: -46.681412,
		formattedAddress:
			"Rua Oscar Freire, 2250 - Pinheiros, São Paulo - SP, 05409-011",
	},
	seed_provider_rafael_mendes: {
		type: "CLINIC",
		postalCode: "22020-001",
		state: "RJ",
		city: "Rio de Janeiro",
		neighborhood: "Copacabana",
		street: "Av. Nossa Senhora de Copacabana",
		number: "680",
		latitude: -22.970722,
		longitude: -43.186874,
		formattedAddress:
			"Av. Nossa Senhora de Copacabana, 680 - Copacabana, Rio de Janeiro - RJ",
	},
	seed_provider_pedro_rocha: {
		type: "CLINIC",
		postalCode: "01413-100",
		state: "SP",
		city: "São Paulo",
		neighborhood: "Cerqueira César",
		street: "Rua Augusta",
		number: "2203",
		latitude: -23.560973,
		longitude: -46.662433,
		formattedAddress:
			"Rua Augusta, 2203 - Cerqueira César, São Paulo - SP, 01413-100",
	},
	seed_provider_beatriz_nunes: {
		type: "CLINIC",
		postalCode: "01452-002",
		state: "SP",
		city: "São Paulo",
		neighborhood: "Jardim Paulista",
		street: "Alameda Santos",
		number: "455",
		latitude: -23.566377,
		longitude: -46.653932,
		formattedAddress:
			"Alameda Santos, 455 - Jardim Paulista, São Paulo - SP, 01452-002",
	},
	seed_provider_marina_alves: {
		type: "CLINIC",
		postalCode: "01310-200",
		state: "SP",
		city: "São Paulo",
		neighborhood: "Bela Vista",
		street: "Av. Paulista",
		number: "1578",
		formattedAddress: "Atendimento online · São Paulo - SP",
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
			countryCode: "BR",
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
	"sorriso@localizasaude.seed": PROVIDER_ADDRESSES.seed_provider_pedro_nogueira,
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
