import { PROVIDERS, REAL_USERS, SEED_CUSTOMERS, SEED_STAFF } from "./constants";
import type { SeedClient, SeedUsers } from "./types";

async function ensureEmailIsAvailable(
	prisma: SeedClient,
	id: string,
	email: string,
) {
	const existing = await prisma.user.findUnique({ where: { email } });

	if (existing && existing.id !== id) {
		throw new Error(
			`Cannot seed ${email}: existing user has id ${existing.id}, expected ${id}.`,
		);
	}
}

export async function seedUsers(prisma: SeedClient): Promise<SeedUsers> {
	console.log("👥 Seeding users...");

	await Promise.all([
		ensureEmailIsAvailable(
			prisma,
			REAL_USERS.customerLucas.id,
			REAL_USERS.customerLucas.email,
		),
		ensureEmailIsAvailable(
			prisma,
			REAL_USERS.providerLucas.id,
			REAL_USERS.providerLucas.email,
		),
		ensureEmailIsAvailable(prisma, REAL_USERS.admin.id, REAL_USERS.admin.email),
	]);

	const lucas = await prisma.user.upsert({
		where: { id: REAL_USERS.customerLucas.id },
		create: {
			id: REAL_USERS.customerLucas.id,
			name: REAL_USERS.customerLucas.name,
			firstName: REAL_USERS.customerLucas.firstName,
			lastName: REAL_USERS.customerLucas.lastName,
			phone: REAL_USERS.customerLucas.phone,
			email: REAL_USERS.customerLucas.email,
			emailVerified: true,
			role: "CUSTOMER",
			onboardingCompleted: true,
			cpf: "123.456.789-10",
			dateOfBirth: new Date("1994-02-14T00:00:00.000Z"),
			address: "Rua Augusta, 1200 - Consolação, São Paulo - SP",
		},
		update: {
			name: REAL_USERS.customerLucas.name,
			firstName: REAL_USERS.customerLucas.firstName,
			lastName: REAL_USERS.customerLucas.lastName,
			phone: REAL_USERS.customerLucas.phone,
			email: REAL_USERS.customerLucas.email,
			emailVerified: true,
			role: "CUSTOMER",
			onboardingCompleted: true,
			cpf: "123.456.789-10",
			dateOfBirth: new Date("1994-02-14T00:00:00.000Z"),
			address: "Rua Augusta, 1200 - Consolação, São Paulo - SP",
		},
	});

	const lucasProvider = await prisma.user.upsert({
		where: { id: REAL_USERS.providerLucas.id },
		create: {
			id: REAL_USERS.providerLucas.id,
			name: REAL_USERS.providerLucas.name,
			firstName: REAL_USERS.providerLucas.firstName,
			lastName: REAL_USERS.providerLucas.lastName,
			phone: REAL_USERS.providerLucas.phone,
			email: REAL_USERS.providerLucas.email,
			emailVerified: true,
			role: "HEALTHCARE_PROVIDER",
			onboardingCompleted: true,
			image:
				"https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400",
			displayName: "Dr. Lucas Furini",
			document: "987.654.321-00",
			birthDate: new Date("1992-08-22T00:00:00.000Z"),
			gender: "Masculino",
			languages: ["Português", "Inglês"],
			specialty: "Clínica geral",
			professionalCategory: "Médico",
			professionalId: "654321",
			professionalCouncilId: "professional-council-crm",
			licenseState: "SP",
			licenseDocumentKey:
				"provider-verification/cmnuu7to60006r1scsref3kpv/crm-sp-654321.pdf",
			licenseDocumentFileName: "crm-sp-654321.pdf",
			licenseDocumentMimeType: "application/pdf",
			licenseDocumentSize: 402_144,
			licenseDocumentSha256:
				"cb8b8f7c9e1f3a4d5e6b7c8d9f0a1b2c3d4e5f60718293a4b5c6d7e8f9a0b1c2",
			licenseDocumentUploadedAt: new Date("2026-05-02T10:00:00.000Z"),
			verificationStatus: "VERIFIED",
			verifiedAt: new Date("2026-05-02T12:00:00.000Z"),
			bio: "Médico clínico geral com foco em acompanhamento preventivo, check-ups e coordenação do cuidado.",
			approach:
				"Consulta objetiva, acolhedora e orientada por dados, com plano de cuidado simples de acompanhar.",
			education:
				"Medicina pela Universidade Federal de São Paulo, residência em Clínica Médica.",
			certifications: "Atualização em medicina preventiva e atenção primária.",
			yearsOfExperience: 9,
			targetAudiences: ["Adultos", "Idosos", "Famílias"],
			serviceModalities: ["IN_PERSON", "ONLINE", "HOME_CARE"],
			clinicAddress:
				"Av. Paulista, 900 - Bela Vista, São Paulo - SP, 01310-100",
			clinicLatitude: -23.564186,
			clinicLongitude: -46.652741,
			clinicNeighborhood: "Bela Vista",
			clinicCity: "São Paulo",
			clinicState: "SP",
			homeCareRadiusKm: 10,
			acceptedInsurance: ["Particular", "Unimed", "Bradesco Saúde"],
			paymentMethods: ["Pix", "Cartão de crédito", "Cartão de débito"],
			cancellationPolicy:
				"Cancelamentos sem custo até 24 horas antes da consulta.",
			clinicPhotos: [
				"provider-clinic-photos/cmnuu7to60006r1scsref3kpv/reception.jpg",
				"provider-clinic-photos/cmnuu7to60006r1scsref3kpv/office.jpg",
			],
			termsAcceptedAt: new Date("2026-05-02T09:30:00.000Z"),
			lgpdConsentAt: new Date("2026-05-02T09:30:00.000Z"),
			professionalResponsibilityAcceptedAt: new Date(
				"2026-05-02T09:30:00.000Z",
			),
		},
		update: {
			name: REAL_USERS.providerLucas.name,
			firstName: REAL_USERS.providerLucas.firstName,
			lastName: REAL_USERS.providerLucas.lastName,
			phone: REAL_USERS.providerLucas.phone,
			email: REAL_USERS.providerLucas.email,
			emailVerified: true,
			role: "HEALTHCARE_PROVIDER",
			onboardingCompleted: true,
			image:
				"https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400",
			displayName: "Dr. Lucas Furini",
			document: "987.654.321-00",
			birthDate: new Date("1992-08-22T00:00:00.000Z"),
			gender: "Masculino",
			languages: ["Português", "Inglês"],
			specialty: "Clínica geral",
			professionalCategory: "Médico",
			professionalId: "654321",
			professionalCouncilId: "professional-council-crm",
			licenseState: "SP",
			licenseDocumentKey:
				"provider-verification/cmnuu7to60006r1scsref3kpv/crm-sp-654321.pdf",
			licenseDocumentFileName: "crm-sp-654321.pdf",
			licenseDocumentMimeType: "application/pdf",
			licenseDocumentSize: 402_144,
			licenseDocumentSha256:
				"cb8b8f7c9e1f3a4d5e6b7c8d9f0a1b2c3d4e5f60718293a4b5c6d7e8f9a0b1c2",
			licenseDocumentUploadedAt: new Date("2026-05-02T10:00:00.000Z"),
			verificationStatus: "VERIFIED",
			verifiedAt: new Date("2026-05-02T12:00:00.000Z"),
			bio: "Médico clínico geral com foco em acompanhamento preventivo, check-ups e coordenação do cuidado.",
			approach:
				"Consulta objetiva, acolhedora e orientada por dados, com plano de cuidado simples de acompanhar.",
			education:
				"Medicina pela Universidade Federal de São Paulo, residência em Clínica Médica.",
			certifications: "Atualização em medicina preventiva e atenção primária.",
			yearsOfExperience: 9,
			targetAudiences: ["Adultos", "Idosos", "Famílias"],
			serviceModalities: ["IN_PERSON", "ONLINE", "HOME_CARE"],
			clinicAddress:
				"Av. Paulista, 900 - Bela Vista, São Paulo - SP, 01310-100",
			clinicLatitude: -23.564186,
			clinicLongitude: -46.652741,
			clinicNeighborhood: "Bela Vista",
			clinicCity: "São Paulo",
			clinicState: "SP",
			homeCareRadiusKm: 10,
			acceptedInsurance: ["Particular", "Unimed", "Bradesco Saúde"],
			paymentMethods: ["Pix", "Cartão de crédito", "Cartão de débito"],
			cancellationPolicy:
				"Cancelamentos sem custo até 24 horas antes da consulta.",
			clinicPhotos: [
				"provider-clinic-photos/cmnuu7to60006r1scsref3kpv/reception.jpg",
				"provider-clinic-photos/cmnuu7to60006r1scsref3kpv/office.jpg",
			],
			termsAcceptedAt: new Date("2026-05-02T09:30:00.000Z"),
			lgpdConsentAt: new Date("2026-05-02T09:30:00.000Z"),
			professionalResponsibilityAcceptedAt: new Date(
				"2026-05-02T09:30:00.000Z",
			),
		},
	});

	const admin = await prisma.user.upsert({
		where: { id: REAL_USERS.admin.id },
		create: {
			id: REAL_USERS.admin.id,
			name: REAL_USERS.admin.name,
			firstName: REAL_USERS.admin.firstName,
			lastName: REAL_USERS.admin.lastName,
			phone: REAL_USERS.admin.phone,
			email: REAL_USERS.admin.email,
			emailVerified: true,
			role: "ADMIN",
			onboardingCompleted: true,
		},
		update: {
			name: REAL_USERS.admin.name,
			firstName: REAL_USERS.admin.firstName,
			lastName: REAL_USERS.admin.lastName,
			phone: REAL_USERS.admin.phone,
			email: REAL_USERS.admin.email,
			emailVerified: true,
			role: "ADMIN",
			onboardingCompleted: true,
		},
	});

	const providers: SeedUsers["providers"] = {};
	const staff: SeedUsers["staff"] = {};
	providers.lucas = lucasProvider;

	const juliana = await prisma.user.create({
		data: {
			...SEED_CUSTOMERS.juliana,
			emailVerified: true,
			role: "CUSTOMER",
			onboardingCompleted: true,
			cpf: "987.654.321-00",
			dateOfBirth: new Date("1992-08-22T00:00:00.000Z"),
			address: "Av. Paulista, 900 - Bela Vista, São Paulo - SP",
		},
	});

	for (const [key, provider] of Object.entries(PROVIDERS)) {
		const { id: _seedId, ...providerData } = provider;

		providers[key] = await prisma.user.create({
			data: {
				...providerData,
				role: "HEALTHCARE_PROVIDER",
				emailVerified: true,
				onboardingCompleted: true,
				verifiedByUserId:
					provider.verificationStatus === "VERIFIED" ? admin.id : null,
				termsAcceptedAt: new Date("2026-04-28T12:00:00.000Z"),
				lgpdConsentAt: new Date("2026-04-28T12:00:00.000Z"),
				professionalResponsibilityAcceptedAt: new Date(
					"2026-04-28T12:00:00.000Z",
				),
			},
		});
	}

	for (const [key, staffUser] of Object.entries(SEED_STAFF)) {
		const { id: _seedId, ...staffData } = staffUser;

		staff[key] = await prisma.user.create({
			data: {
				...staffData,
				role: "STAFF",
				emailVerified: true,
				onboardingCompleted: true,
			},
		});
	}

	console.log(
		`✅ Users ready: 1 real customer, 1 real provider, 1 real admin, 1 seed customer, ${Object.keys(providers).length - 1} seed providers, ${Object.keys(staff).length} seed staff`,
	);

	return {
		customers: {
			lucas,
			juliana,
		},
		admin,
		providers,
		staff,
	};
}
