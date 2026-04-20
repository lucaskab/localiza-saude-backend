import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
	console.log("🌱 Starting database seed...");

	// Delete all data before seeding (in correct order due to foreign keys)
	console.log("🗑️  Cleaning existing data...");
	await prisma.session.deleteMany({});
	await prisma.account.deleteMany({});
	await prisma.conversation_message.deleteMany({});
	await prisma.conversation.deleteMany({});
	await prisma.appointment_procedure.deleteMany({});
	await prisma.appointment.deleteMany({});
	await prisma.healthcare_provider_schedule.deleteMany({});
	await prisma.procedure.deleteMany({});
	await prisma.healthcare_provider_category.deleteMany({});
	await prisma.category.deleteMany({});
	await prisma.healthcare_provider.deleteMany({});
	await prisma.customer.deleteMany({});
	await prisma.clinic.deleteMany({});
	await prisma.user.deleteMany({});

	// Create Users
	console.log("👥 Creating users...");

	const owner1 = await prisma.user.create({
		data: {
			name: "Dr. Ana Silva",
			firstName: "Ana",
			lastName: "Silva",
			phone: "+5511999887766",
			email: "ana.silva@email.com",
			emailVerified: true,
			role: "HEALTHCARE_PROVIDER",
		},
	});

	const owner2 = await prisma.user.create({
		data: {
			name: "Dr. Carlos Santos",
			firstName: "Carlos",
			lastName: "Santos",
			phone: "+5521988776655",
			email: "carlos.santos@email.com",
			emailVerified: true,
			role: "HEALTHCARE_PROVIDER",
		},
	});

	const owner3 = await prisma.user.create({
		data: {
			name: "Dra. Maria Oliveira",
			firstName: "Maria",
			lastName: "Oliveira",
			phone: "+5511977665544",
			email: "maria.oliveira@email.com",
			emailVerified: true,
			role: "HEALTHCARE_PROVIDER",
		},
	});

	const owner4 = await prisma.user.create({
		data: {
			name: "Dr. João Ferreira",
			firstName: "João",
			lastName: "Ferreira",
			phone: "+5521966554433",
			email: "joao.ferreira@email.com",
			emailVerified: true,
			role: "HEALTHCARE_PROVIDER",
		},
	});

	const owner5 = await prisma.user.create({
		data: {
			name: "Dra. Beatriz Costa",
			firstName: "Beatriz",
			lastName: "Costa",
			phone: "+5511955443322",
			email: "beatriz.costa@email.com",
			emailVerified: true,
			role: "HEALTHCARE_PROVIDER",
		},
	});

	const customer1 = await prisma.user.create({
		data: {
			name: "Lucas Mendes",
			firstName: "Lucas",
			lastName: "Mendes",
			phone: "+5511944332211",
			email: "lucas.mendes@email.com",
			emailVerified: true,
			role: "CUSTOMER",
		},
	});

	const customer2 = await prisma.user.create({
		data: {
			name: "Juliana Rodrigues",
			firstName: "Juliana",
			lastName: "Rodrigues",
			phone: "+5521933221100",
			email: "juliana.rodrigues@email.com",
			emailVerified: true,
			role: "CUSTOMER",
		},
	});

	console.log(`✅ Created ${7} users`);

	// Create Healthcare Providers
	console.log("🩺 Creating healthcare providers...");

	const provider1 = await prisma.healthcare_provider.create({
		data: {
			userId: owner1.id,
			specialty: "Clínico Geral",
			professionalId: "CRM-SP 123456",
			bio: "Médica com mais de 15 anos de experiência em clínica geral e medicina preventiva.",
		},
	});

	const provider2 = await prisma.healthcare_provider.create({
		data: {
			userId: owner2.id,
			specialty: "Odontologia",
			professionalId: "CRO-RJ 45678",
			bio: "Dentista especializado em estética dental e implantes.",
		},
	});

	const provider3 = await prisma.healthcare_provider.create({
		data: {
			userId: owner3.id,
			specialty: "Oftalmologia",
			professionalId: "CRM-SP 789012",
			bio: "Oftalmologista com especialização em cirurgia refrativa e catarata.",
		},
	});

	const provider4 = await prisma.healthcare_provider.create({
		data: {
			userId: owner4.id,
			specialty: "Dermatologia",
			professionalId: "CRM-RJ 345678",
			bio: "Dermatologista focado em tratamentos estéticos e saúde da pele.",
		},
	});

	const provider5 = await prisma.healthcare_provider.create({
		data: {
			userId: owner5.id,
			specialty: "Cardiologia",
			professionalId: "CRM-SP 901234",
			bio: "Cardiologista com experiência em prevenção e tratamento de doenças cardiovasculares.",
		},
	});

	console.log(`✅ Created ${5} healthcare providers`);

	// Create Healthcare Provider Schedules
	console.log("📅 Creating healthcare provider schedules...");

	// Provider 1: Mon-Fri 09:00-17:00
	const schedule1Mon = await prisma.healthcare_provider_schedule.create({
		data: {
			healthcareProviderId: provider1.id,
			dayOfWeek: 1,
			startTime: "09:00",
			endTime: "17:00",
		},
	});
	await prisma.healthcare_provider_schedule.create({
		data: {
			healthcareProviderId: provider1.id,
			dayOfWeek: 2,
			startTime: "09:00",
			endTime: "17:00",
		},
	});
	await prisma.healthcare_provider_schedule.create({
		data: {
			healthcareProviderId: provider1.id,
			dayOfWeek: 3,
			startTime: "09:00",
			endTime: "17:00",
		},
	});
	await prisma.healthcare_provider_schedule.create({
		data: {
			healthcareProviderId: provider1.id,
			dayOfWeek: 4,
			startTime: "09:00",
			endTime: "17:00",
		},
	});
	await prisma.healthcare_provider_schedule.create({
		data: {
			healthcareProviderId: provider1.id,
			dayOfWeek: 5,
			startTime: "09:00",
			endTime: "17:00",
		},
	});

	// Provider 2: Mon-Fri 08:00-18:00
	await prisma.healthcare_provider_schedule.create({
		data: {
			healthcareProviderId: provider2.id,
			dayOfWeek: 1,
			startTime: "08:00",
			endTime: "18:00",
		},
	});
	await prisma.healthcare_provider_schedule.create({
		data: {
			healthcareProviderId: provider2.id,
			dayOfWeek: 2,
			startTime: "08:00",
			endTime: "18:00",
		},
	});
	await prisma.healthcare_provider_schedule.create({
		data: {
			healthcareProviderId: provider2.id,
			dayOfWeek: 3,
			startTime: "08:00",
			endTime: "18:00",
		},
	});
	await prisma.healthcare_provider_schedule.create({
		data: {
			healthcareProviderId: provider2.id,
			dayOfWeek: 4,
			startTime: "08:00",
			endTime: "18:00",
		},
	});
	await prisma.healthcare_provider_schedule.create({
		data: {
			healthcareProviderId: provider2.id,
			dayOfWeek: 5,
			startTime: "08:00",
			endTime: "18:00",
		},
	});

	// Provider 3: Tue-Sat 10:00-16:00
	await prisma.healthcare_provider_schedule.create({
		data: {
			healthcareProviderId: provider3.id,
			dayOfWeek: 2,
			startTime: "10:00",
			endTime: "16:00",
		},
	});
	await prisma.healthcare_provider_schedule.create({
		data: {
			healthcareProviderId: provider3.id,
			dayOfWeek: 3,
			startTime: "10:00",
			endTime: "16:00",
		},
	});
	await prisma.healthcare_provider_schedule.create({
		data: {
			healthcareProviderId: provider3.id,
			dayOfWeek: 4,
			startTime: "10:00",
			endTime: "16:00",
		},
	});
	await prisma.healthcare_provider_schedule.create({
		data: {
			healthcareProviderId: provider3.id,
			dayOfWeek: 5,
			startTime: "10:00",
			endTime: "16:00",
		},
	});
	await prisma.healthcare_provider_schedule.create({
		data: {
			healthcareProviderId: provider3.id,
			dayOfWeek: 6,
			startTime: "10:00",
			endTime: "16:00",
		},
	});

	// Provider 4: Mon, Wed, Fri 09:00-17:00
	await prisma.healthcare_provider_schedule.create({
		data: {
			healthcareProviderId: provider4.id,
			dayOfWeek: 1,
			startTime: "09:00",
			endTime: "17:00",
		},
	});
	await prisma.healthcare_provider_schedule.create({
		data: {
			healthcareProviderId: provider4.id,
			dayOfWeek: 3,
			startTime: "09:00",
			endTime: "17:00",
		},
	});
	await prisma.healthcare_provider_schedule.create({
		data: {
			healthcareProviderId: provider4.id,
			dayOfWeek: 5,
			startTime: "09:00",
			endTime: "17:00",
		},
	});

	// Provider 5: Mon-Thu 08:00-16:00
	await prisma.healthcare_provider_schedule.create({
		data: {
			healthcareProviderId: provider5.id,
			dayOfWeek: 1,
			startTime: "08:00",
			endTime: "16:00",
		},
	});
	await prisma.healthcare_provider_schedule.create({
		data: {
			healthcareProviderId: provider5.id,
			dayOfWeek: 2,
			startTime: "08:00",
			endTime: "16:00",
		},
	});
	await prisma.healthcare_provider_schedule.create({
		data: {
			healthcareProviderId: provider5.id,
			dayOfWeek: 3,
			startTime: "08:00",
			endTime: "16:00",
		},
	});
	await prisma.healthcare_provider_schedule.create({
		data: {
			healthcareProviderId: provider5.id,
			dayOfWeek: 4,
			startTime: "08:00",
			endTime: "16:00",
		},
	});

	console.log(`✅ Created ${23} healthcare provider schedules`);

	// Create Customers
	console.log("👤 Creating customers...");

	const customerProfile1 = await prisma.customer.create({
		data: {
			userId: customer1.id,
			cpf: "123.456.789-00",
			dateOfBirth: new Date("1990-05-15"),
			address: "Rua das Flores, 123 - São Paulo, SP",
		},
	});

	const customerProfile2 = await prisma.customer.create({
		data: {
			userId: customer2.id,
			cpf: "987.654.321-00",
			dateOfBirth: new Date("1985-08-22"),
			address: "Av. Atlântica, 456 - Rio de Janeiro, RJ",
		},
	});

	console.log(`✅ Created ${2} customers`);

	// Create Categories
	console.log("📂 Creating categories...");

	const cardiology = await prisma.category.create({
		data: {
			name: "Cardiology",
			description: "Heart and cardiovascular system specialists",
		},
	});

	const dermatology = await prisma.category.create({
		data: {
			name: "Dermatology",
			description: "Skin, hair, and nail specialists",
		},
	});

	const pediatrics = await prisma.category.create({
		data: {
			name: "Pediatrics",
			description: "Medical care for infants, children, and adolescents",
		},
	});

	const orthopedics = await prisma.category.create({
		data: {
			name: "Orthopedics",
			description: "Musculoskeletal system specialists",
		},
	});

	const nutrition = await prisma.category.create({
		data: {
			name: "Nutrition",
			description: "Diet and nutrition specialists",
		},
	});

	const physiotherapy = await prisma.category.create({
		data: {
			name: "Physiotherapy",
			description: "Physical rehabilitation and movement specialists",
		},
	});

	const dentistry = await prisma.category.create({
		data: {
			name: "Dentistry",
			description: "Oral health and dental care specialists",
		},
	});

	const ophthalmology = await prisma.category.create({
		data: {
			name: "Ophthalmology",
			description: "Eye and vision care specialists",
		},
	});

	const psychology = await prisma.category.create({
		data: {
			name: "Psychology",
			description: "Mental health and behavioral specialists",
		},
	});

	const generalPractice = await prisma.category.create({
		data: {
			name: "General Practice",
			description: "Primary care and family medicine",
		},
	});

	console.log(`✅ Created ${10} categories`);

	// Create Healthcare Provider Categories relationships
	console.log("🔗 Creating healthcare provider-category relationships...");

	await prisma.healthcare_provider_category.createMany({
		data: [
			// Provider 1 - Cardiology
			{ healthcareProviderId: provider1.id, categoryId: cardiology.id },
			// Provider 2 - Dermatology and General Practice
			{ healthcareProviderId: provider2.id, categoryId: dermatology.id },
			{ healthcareProviderId: provider2.id, categoryId: generalPractice.id },
			// Provider 3 - Pediatrics
			{ healthcareProviderId: provider3.id, categoryId: pediatrics.id },
			// Provider 4 - Dentistry
			{ healthcareProviderId: provider4.id, categoryId: dentistry.id },
			// Provider 5 - Physiotherapy and Orthopedics
			{ healthcareProviderId: provider5.id, categoryId: physiotherapy.id },
			{ healthcareProviderId: provider5.id, categoryId: orthopedics.id },
		],
	});

	console.log(`✅ Created ${7} healthcare provider-category relationships`);

	// Create Clinics with real Brazilian coordinates
	console.log("🏥 Creating clinics...");

	const clinic1 = await prisma.clinic.create({
		data: {
			name: "Centro Médico Paulista",
			phone: "+5511999887766",
			email: "contato@centromedicoPaulista.com",
			description: "Clínica de medicina geral com especialidades médicas",
			type: "MEDICAL",
			latitude: -23.5505,
			longitude: -46.6333,
			ownerId: owner1.id,
		},
	});

	const clinic2 = await prisma.clinic.create({
		data: {
			name: "Clínica Odontológica Sorrisos",
			phone: "+5511988776655",
			email: "contato@sorrisos.com",
			description: "Especializada em odontologia e estética dental",
			type: "DENTAL",
			latitude: -23.5489,
			longitude: -46.6388,
			ownerId: owner2.id,
		},
	});

	const clinic3 = await prisma.clinic.create({
		data: {
			name: "Clínica de Olhos Visão Clara",
			phone: "+5521988776655",
			email: "contato@visaoclara.com",
			description: "Oftalmologia completa com equipamentos modernos",
			type: "EYE",
			latitude: -22.9068,
			longitude: -43.1729,
			ownerId: owner3.id,
		},
	});

	const clinic4 = await prisma.clinic.create({
		data: {
			name: "Spa e Estética Beleza Natural",
			phone: "+5511977665544",
			email: "contato@belezanatural.com",
			description: "Tratamentos estéticos e de beleza",
			type: "BEAUTY",
			latitude: -23.5631,
			longitude: -46.6544,
			ownerId: owner4.id,
		},
	});

	const clinic5 = await prisma.clinic.create({
		data: {
			name: "Centro de Saúde Bem Viver",
			phone: "+5511966554433",
			email: "contato@bemviver.com",
			description: "Centro de saúde e wellness com diversas especialidades",
			type: "HEALTH",
			latitude: -23.5558,
			longitude: -46.6396,
			ownerId: owner5.id,
		},
	});

	const clinic6 = await prisma.clinic.create({
		data: {
			name: "UBS Vila Mariana",
			phone: "+5511955443322",
			email: "ubs.vilamariana@saude.gov.br",
			description: "Unidade Básica de Saúde - Atendimento gratuito pelo SUS",
			type: "FREE",
			latitude: -23.588,
			longitude: -46.6361,
			ownerId: owner1.id,
		},
	});

	const clinic7 = await prisma.clinic.create({
		data: {
			name: "Hospital São Lucas",
			phone: "+5521999887766",
			email: "contato@hospitalsaolucas.com",
			description: "Hospital geral com pronto atendimento 24h",
			type: "MEDICAL",
			latitude: -22.9711,
			longitude: -43.1822,
			ownerId: owner2.id,
		},
	});

	const clinic8 = await prisma.clinic.create({
		data: {
			name: "Clínica Dental Ipanema",
			phone: "+5521988776655",
			email: "contato@dentalipanema.com",
			description: "Odontologia de excelência na Zona Sul",
			type: "DENTAL",
			latitude: -22.9838,
			longitude: -43.2043,
			ownerId: owner3.id,
		},
	});

	const clinic9 = await prisma.clinic.create({
		data: {
			name: "Centro Médico Jardins",
			phone: "+5511944332211",
			email: "contato@medicojardins.com",
			description: "Clínica médica multiespecialidades",
			type: "MEDICAL",
			latitude: -23.5685,
			longitude: -46.6641,
			ownerId: owner4.id,
		},
	});

	const clinic10 = await prisma.clinic.create({
		data: {
			name: "Clínica de Saúde Integrada",
			phone: "+5511933221100",
			email: "contato@saudeintegrada.com",
			description: "Saúde e bem-estar com abordagem integrativa",
			type: "HEALTH",
			latitude: -23.5475,
			longitude: -46.6361,
			ownerId: owner5.id,
		},
	});

	console.log(`✅ Created ${10} clinics`);

	// Add employees to some clinics
	console.log("👨‍⚕️ Adding employees to clinics...");

	await prisma.clinic.update({
		where: { id: clinic1.id },
		data: {
			employees: {
				connect: [{ id: owner2.id }, { id: owner3.id }],
			},
		},
	});

	await prisma.clinic.update({
		where: { id: clinic7.id },
		data: {
			employees: {
				connect: [{ id: owner4.id }, { id: owner5.id }],
			},
		},
	});

	console.log("✅ Added employees to clinics");

	// Create Procedures
	console.log("💉 Creating procedures...");

	// Provider 1 - Clínico Geral (Dr. Ana Silva)
	const procedure1 = await prisma.procedure.create({
		data: {
			name: "Consulta Médica Geral",
			description: "Consulta médica completa com avaliação geral de saúde",
			priceInCents: 15000,
			durationInMinutes: 30,
			healthcareProviderId: provider1.id,
		},
	});

	const procedure2 = await prisma.procedure.create({
		data: {
			name: "Exame de Sangue Completo",
			description: "Coleta e análise completa de sangue incluindo hemograma",
			priceInCents: 8000,
			durationInMinutes: 15,
			healthcareProviderId: provider1.id,
		},
	});

	const procedure3 = await prisma.procedure.create({
		data: {
			name: "Check-up Anual",
			description: "Avaliação médica completa anual com exames básicos",
			priceInCents: 30000,
			durationInMinutes: 60,
			healthcareProviderId: provider1.id,
		},
	});

	// Provider 2 - Odontologia (Dr. Carlos Santos)
	const procedure4 = await prisma.procedure.create({
		data: {
			name: "Limpeza Dental",
			description: "Limpeza profunda com remoção de tártaro e polimento",
			priceInCents: 12000,
			durationInMinutes: 45,
			healthcareProviderId: provider2.id,
		},
	});

	const procedure5 = await prisma.procedure.create({
		data: {
			name: "Tratamento de Canal",
			description: "Tratamento endodôntico completo",
			priceInCents: 80000,
			durationInMinutes: 90,
			healthcareProviderId: provider2.id,
		},
	});

	const procedure6 = await prisma.procedure.create({
		data: {
			name: "Clareamento Dental",
			description: "Clareamento dental profissional com laser",
			priceInCents: 60000,
			durationInMinutes: 60,
			healthcareProviderId: provider2.id,
		},
	});

	// Provider 3 - Oftalmologia (Dra. Maria Oliveira)
	const procedure7 = await prisma.procedure.create({
		data: {
			name: "Exame de Vista Completo",
			description: "Exame oftalmológico completo com mapeamento de retina",
			priceInCents: 15000,
			durationInMinutes: 30,
			healthcareProviderId: provider3.id,
		},
	});

	const procedure8 = await prisma.procedure.create({
		data: {
			name: "Teste de Glaucoma",
			description: "Avaliação completa para detecção de glaucoma",
			priceInCents: 18000,
			durationInMinutes: 25,
			healthcareProviderId: provider3.id,
		},
	});

	const procedure9 = await prisma.procedure.create({
		data: {
			name: "Adaptação de Lentes de Contato",
			description: "Consulta e adaptação de lentes de contato",
			priceInCents: 20000,
			durationInMinutes: 40,
			healthcareProviderId: provider3.id,
		},
	});

	// Provider 4 - Dermatologia (Dr. João Ferreira)
	const procedure10 = await prisma.procedure.create({
		data: {
			name: "Consulta Dermatológica",
			description: "Avaliação dermatológica completa",
			priceInCents: 18000,
			durationInMinutes: 30,
			healthcareProviderId: provider4.id,
		},
	});

	const procedure11 = await prisma.procedure.create({
		data: {
			name: "Limpeza de Pele Profunda",
			description: "Limpeza facial profunda com extração",
			priceInCents: 25000,
			durationInMinutes: 60,
			healthcareProviderId: provider4.id,
		},
	});

	const procedure12 = await prisma.procedure.create({
		data: {
			name: "Aplicação de Botox",
			description: "Aplicação de toxina botulínica para tratamento estético",
			priceInCents: 120000,
			durationInMinutes: 45,
			healthcareProviderId: provider4.id,
		},
	});

	// Provider 5 - Cardiologia (Dra. Beatriz Costa)
	const procedure13 = await prisma.procedure.create({
		data: {
			name: "Consulta Cardiológica",
			description: "Consulta completa com avaliação cardiovascular",
			priceInCents: 20000,
			durationInMinutes: 40,
			healthcareProviderId: provider5.id,
		},
	});

	const procedure14 = await prisma.procedure.create({
		data: {
			name: "Eletrocardiograma",
			description: "ECG para avaliação da atividade elétrica do coração",
			priceInCents: 10000,
			durationInMinutes: 20,
			healthcareProviderId: provider5.id,
		},
	});

	const procedure15 = await prisma.procedure.create({
		data: {
			name: "Ultrassom Cardíaco",
			description: "Ecocardiograma com doppler colorido",
			priceInCents: 35000,
			durationInMinutes: 45,
			healthcareProviderId: provider5.id,
		},
	});

	const procedure16 = await prisma.procedure.create({
		data: {
			name: "Teste Ergométrico",
			description: "Teste de esforço para avaliação cardíaca",
			priceInCents: 28000,
			durationInMinutes: 50,
			healthcareProviderId: provider5.id,
		},
	});

	console.log(`✅ Created ${16} procedures`);

	// Create Appointments
	console.log("📅 Creating appointments...");

	// Appointment 1: SCHEDULED - Future appointment for customer 1 with provider 1
	const appointment1 = await prisma.appointment.create({
		data: {
			customerId: customerProfile1.id,
			healthcareProviderId: provider1.id,
			scheduledAt: new Date("2024-12-20T10:00:00"),
			status: "SCHEDULED",
			totalDurationMinutes:
				procedure1.durationInMinutes + procedure2.durationInMinutes,
			totalPriceCents: procedure1.priceInCents + procedure2.priceInCents,
			notes: "Consulta de rotina e exames",
			appointmentProcedures: {
				create: [
					{ procedureId: procedure1.id },
					{ procedureId: procedure2.id },
				],
			},
		},
	});

	// Appointment 2: CONFIRMED - Future appointment for customer 2 with provider 2
	const appointment2 = await prisma.appointment.create({
		data: {
			customerId: customerProfile2.id,
			healthcareProviderId: provider2.id,
			scheduledAt: new Date("2024-12-18T14:00:00"),
			status: "CONFIRMED",
			totalDurationMinutes: procedure4.durationInMinutes,
			totalPriceCents: procedure4.priceInCents,
			notes: "Limpeza dental agendada",
			appointmentProcedures: {
				create: [{ procedureId: procedure4.id }],
			},
		},
	});

	// Appointment 3: COMPLETED - Past appointment for customer 1 with provider 3
	await prisma.appointment.create({
		data: {
			customerId: customerProfile1.id,
			healthcareProviderId: provider3.id,
			scheduledAt: new Date("2024-11-15T11:00:00"),
			status: "COMPLETED",
			totalDurationMinutes:
				procedure7.durationInMinutes + procedure8.durationInMinutes,
			totalPriceCents: procedure7.priceInCents + procedure8.priceInCents,
			notes: "Exame de vista e adaptação de lentes",
			appointmentProcedures: {
				create: [
					{ procedureId: procedure7.id },
					{ procedureId: procedure8.id },
				],
			},
		},
	});

	// Appointment 4: COMPLETED - Past appointment for customer 2 with provider 4
	await prisma.appointment.create({
		data: {
			customerId: customerProfile2.id,
			healthcareProviderId: provider4.id,
			scheduledAt: new Date("2024-10-20T09:30:00"),
			status: "COMPLETED",
			totalDurationMinutes:
				procedure10.durationInMinutes +
				procedure11.durationInMinutes +
				procedure12.durationInMinutes,
			totalPriceCents:
				procedure10.priceInCents +
				procedure11.priceInCents +
				procedure12.priceInCents,
			notes: "Tratamento completo de pele",
			appointmentProcedures: {
				create: [
					{ procedureId: procedure10.id },
					{ procedureId: procedure11.id },
					{ procedureId: procedure12.id },
				],
			},
		},
	});

	// Appointment 5: SCHEDULED - Future appointment for customer 1 with provider 5
	await prisma.appointment.create({
		data: {
			customerId: customerProfile1.id,
			healthcareProviderId: provider5.id,
			scheduledAt: new Date("2024-12-22T08:00:00"),
			status: "SCHEDULED",
			totalDurationMinutes:
				procedure13.durationInMinutes + procedure16.durationInMinutes,
			totalPriceCents: procedure13.priceInCents + procedure16.priceInCents,
			notes: "Check-up cardíaco completo",
			appointmentProcedures: {
				create: [
					{ procedureId: procedure13.id },
					{ procedureId: procedure16.id },
				],
			},
		},
	});

	// Appointment 6: CONFIRMED - Future appointment for customer 2 with provider 1
	await prisma.appointment.create({
		data: {
			customerId: customerProfile2.id,
			healthcareProviderId: provider1.id,
			scheduledAt: new Date("2024-12-19T15:00:00"),
			status: "CONFIRMED",
			totalDurationMinutes: procedure3.durationInMinutes,
			totalPriceCents: procedure3.priceInCents,
			notes: "Exame de sangue",
			appointmentProcedures: {
				create: [{ procedureId: procedure3.id }],
			},
		},
	});

	// Appointment 7: COMPLETED - Past appointment for customer 1 with provider 2
	await prisma.appointment.create({
		data: {
			customerId: customerProfile1.id,
			healthcareProviderId: provider2.id,
			scheduledAt: new Date("2024-09-10T10:00:00"),
			status: "COMPLETED",
			totalDurationMinutes:
				procedure5.durationInMinutes + procedure6.durationInMinutes,
			totalPriceCents: procedure5.priceInCents + procedure6.priceInCents,
			notes: "Clareamento e tratamento de canal",
			appointmentProcedures: {
				create: [
					{ procedureId: procedure5.id },
					{ procedureId: procedure6.id },
				],
			},
		},
	});

	// Appointment 8: SCHEDULED - Future appointment for customer 2 with provider 3
	await prisma.appointment.create({
		data: {
			customerId: customerProfile2.id,
			healthcareProviderId: provider3.id,
			scheduledAt: new Date("2024-12-21T13:00:00"),
			status: "SCHEDULED",
			totalDurationMinutes: procedure9.durationInMinutes,
			totalPriceCents: procedure9.priceInCents,
			notes: "Cirurgia de catarata",
			appointmentProcedures: {
				create: [{ procedureId: procedure9.id }],
			},
		},
	});

	console.log(`✅ Created ${8} appointments`);

	// Create Conversations
	console.log("💬 Creating conversations...");

	// Conversation 1: Between customer1 and provider1
	const conversation1 = await prisma.conversation.create({
		data: {
			customerId: customerProfile1.id,
			healthcareProviderId: provider1.id,
			lastMessageAt: new Date("2024-01-15T14:30:00"),
		},
	});

	// Conversation 2: Between customer2 and provider1
	const conversation2 = await prisma.conversation.create({
		data: {
			customerId: customerProfile2.id,
			healthcareProviderId: provider1.id,
			lastMessageAt: new Date("2024-01-16T10:15:00"),
		},
	});

	console.log(`✅ Created ${2} conversations`);

	// Create Messages
	console.log("📨 Creating conversation messages...");

	// Messages for Conversation 1 (customer1 with provider)
	await prisma.conversation_message.create({
		data: {
			conversationId: conversation1.id,
			senderId: customer1.id,
			senderType: "CUSTOMER",
			messageType: "TEXT",
			content: "Olá doutor, gostaria de agendar uma consulta de retorno.",
			relatedAppointmentId: appointment1.id,
			createdAt: new Date("2024-01-15T10:00:00"),
		},
	});

	await prisma.conversation_message.create({
		data: {
			conversationId: conversation1.id,
			senderId: owner1.id,
			senderType: "HEALTHCARE_PROVIDER",
			messageType: "TEXT",
			content: "Bom dia Lucas! Claro, quando seria melhor para você?",
			createdAt: new Date("2024-01-15T10:30:00"),
		},
	});

	await prisma.conversation_message.create({
		data: {
			conversationId: conversation1.id,
			senderId: customer1.id,
			senderType: "CUSTOMER",
			messageType: "TEXT",
			content: "Teria disponibilidade na próxima semana?",
			createdAt: new Date("2024-01-15T11:00:00"),
		},
	});

	await prisma.conversation_message.create({
		data: {
			conversationId: conversation1.id,
			senderId: owner1.id,
			senderType: "HEALTHCARE_PROVIDER",
			messageType: "TEXT",
			content:
				"Sim, tenho horários disponíveis na terça e quinta-feira. Prefere manhã ou tarde?",
			createdAt: new Date("2024-01-15T11:15:00"),
		},
	});

	await prisma.conversation_message.create({
		data: {
			conversationId: conversation1.id,
			senderId: customer1.id,
			senderType: "CUSTOMER",
			messageType: "FILE",
			content: "Segue o exame que você pediu",
			fileUrl:
				"https://pub-demo.r2.dev/messages/1705324800000-abc123-exame-sangue.pdf",
			fileName: "exame-sangue.pdf",
			fileSize: 524288,
			fileMimeType: "application/pdf",
			createdAt: new Date("2024-01-15T14:00:00"),
		},
	});

	await prisma.conversation_message.create({
		data: {
			conversationId: conversation1.id,
			senderId: owner1.id,
			senderType: "HEALTHCARE_PROVIDER",
			messageType: "TEXT",
			content:
				"Perfeito! Recebi o exame. Vou analisar e te envio o laudo em breve.",
			createdAt: new Date("2024-01-15T14:30:00"),
		},
	});

	// Messages for Conversation 2 (customer2 with provider)
	await prisma.conversation_message.create({
		data: {
			conversationId: conversation2.id,
			senderId: customer2.id,
			senderType: "CUSTOMER",
			messageType: "TEXT",
			content: "Boa tarde doutor, preciso remarcar minha consulta.",
			relatedAppointmentId: appointment2.id,
			createdAt: new Date("2024-01-16T09:00:00"),
		},
	});

	await prisma.conversation_message.create({
		data: {
			conversationId: conversation2.id,
			senderId: owner1.id,
			senderType: "HEALTHCARE_PROVIDER",
			messageType: "TEXT",
			content:
				"Boa tarde Juliana! Sem problemas. Que dia funciona melhor para você?",
			createdAt: new Date("2024-01-16T09:30:00"),
		},
	});

	await prisma.conversation_message.create({
		data: {
			conversationId: conversation2.id,
			senderId: customer2.id,
			senderType: "CUSTOMER",
			messageType: "TEXT",
			content: "Poderia ser na sexta-feira de tarde?",
			createdAt: new Date("2024-01-16T10:00:00"),
		},
	});

	await prisma.conversation_message.create({
		data: {
			conversationId: conversation2.id,
			senderId: owner1.id,
			senderType: "HEALTHCARE_PROVIDER",
			messageType: "FILE",
			content: "Confirmo! Vou enviar a nova receita médica",
			fileUrl:
				"https://pub-demo.r2.dev/messages/1705410900000-def456-receita-medica.pdf",
			fileName: "receita-medica.pdf",
			fileSize: 245760,
			fileMimeType: "application/pdf",
			createdAt: new Date("2024-01-16T10:15:00"),
		},
	});

	console.log(`✅ Created ${10} conversation messages`);

	// Summary
	console.log("\n📊 Seed Summary:");
	console.log("================");
	console.log(`👥 Users: ${7} (${5} providers, ${2} customers)`);
	console.log(`🩺 Healthcare Providers: ${5}`);
	console.log(`👤 Customers: ${2}`);
	console.log(`💬 Conversations: ${2}`);
	console.log(`📨 Messages: ${10} (${8} TEXT, ${2} FILE)`);
	console.log(`🏥 Clinics: ${10}`);
	console.log(
		`   - MEDICAL: ${3} clinics\n   - DENTAL: ${2} clinics\n   - EYE: ${1} clinic\n   - BEAUTY: ${1} clinic\n   - HEALTH: ${2} clinics\n   - FREE: ${1} clinic`,
	);
	console.log(`💉 Procedures: ${16}`);
	console.log(`📅 Schedules: ${23}`);
	console.log(
		`🗓️  Appointments: ${8} (${3} SCHEDULED, ${2} CONFIRMED, ${3} COMPLETED)`,
	);
	console.log("\n📍 Locations:");
	console.log("   - São Paulo: 7 clinics");
	console.log("   - Rio de Janeiro: 3 clinics");

	console.log("\n✨ Seed completed successfully!");
	console.log("\n📝 Sample User Credentials:");
	console.log("================");
	console.log("Providers:");
	console.log(`  - ana.silva@email.com (Owner: ${clinic1.name})`);
	console.log(`  - carlos.santos@email.com (Owner: ${clinic2.name})`);
	console.log(`  - maria.oliveira@email.com (Owner: ${clinic3.name})`);
	console.log(`  - joao.ferreira@email.com (Owner: ${clinic4.name})`);
	console.log(`  - beatriz.costa@email.com (Owner: ${clinic5.name})`);
	console.log("\nCustomers:");
	console.log("  - lucas.mendes@email.com");
	console.log("  - juliana.rodrigues@email.com");

	console.log("\n🔑 Sample IDs for Environment Variables:");
	console.log("================");
	console.log("\nClinic IDs:");
	console.log(`  SAMPLE_CLINIC_ID_1=${clinic1.id}`);
	console.log(`  SAMPLE_CLINIC_ID_2=${clinic2.id}`);
	console.log(`  SAMPLE_CLINIC_ID_3=${clinic3.id}`);
	console.log(`  SAMPLE_CLINIC_ID_4=${clinic7.id}`);

	console.log("\nUser IDs:");
	console.log(`  SAMPLE_PROVIDER_ID_1=${owner1.id}`);
	console.log(`  SAMPLE_PROVIDER_ID_2=${owner2.id}`);
	console.log(`  SAMPLE_CUSTOMER_ID_1=${customer1.id}`);
	console.log(`  SAMPLE_CUSTOMER_ID_2=${customer2.id}`);

	console.log("\nHealthcare Provider IDs:");
	console.log(`  SAMPLE_HC_PROVIDER_ID_1=${provider1.id}`);
	console.log(`  SAMPLE_HC_PROVIDER_ID_2=${provider2.id}`);
	console.log(`  SAMPLE_HC_PROVIDER_ID_3=${provider3.id}`);
	console.log(`  SAMPLE_HC_PROVIDER_ID_4=${provider4.id}`);
	console.log(`  SAMPLE_HC_PROVIDER_ID_5=${provider5.id}`);

	console.log("\nCustomer Profile IDs:");
	console.log(`  SAMPLE_CUSTOMER_PROFILE_ID_1=${customerProfile1.id}`);
	console.log(`  SAMPLE_CUSTOMER_PROFILE_ID_2=${customerProfile2.id}`);

	console.log("\nProcedure IDs (for testing):");
	console.log(`  SAMPLE_PROCEDURE_ID_1=${procedure1.id} (${procedure1.name})`);
	console.log(`  SAMPLE_PROCEDURE_ID_2=${procedure4.id} (${procedure4.name})`);
	console.log(`  SAMPLE_PROCEDURE_ID_3=${procedure7.id} (${procedure7.name})`);
	console.log(
		`  SAMPLE_PROCEDURE_ID_4=${procedure10.id} (${procedure10.name})`,
	);
	console.log(
		`  SAMPLE_PROCEDURE_ID_5=${procedure13.id} (${procedure13.name})`,
	);

	console.log("\n🧪 Test nearby search with:");
	console.log(
		"  São Paulo (Paulista Ave): latitude=-23.5505&longitude=-46.6333",
	);
	console.log("  Rio (Copacabana): latitude=-22.9711&longitude=-43.1822");

	console.log("\nSchedule IDs (sample):");
	console.log(
		`  SAMPLE_SCHEDULE_ID_1=${schedule1Mon.id} (Provider 1 - Monday)`,
	);

	console.log("\nAppointment IDs (sample):");
	console.log(`  SAMPLE_APPOINTMENT_ID_1=${appointment1.id} (SCHEDULED)`);
	console.log(`  SAMPLE_APPOINTMENT_ID_2=${appointment2.id} (CONFIRMED)`);

	console.log("\nConversation IDs:");
	console.log(
		`  SAMPLE_CONVERSATION_ID_1=${conversation1.id} (Customer 1 with Provider 1)`,
	);
	console.log(
		`  SAMPLE_CONVERSATION_ID_2=${conversation2.id} (Customer 2 with Provider 1)`,
	);

	console.log("\n💡 Quick Reference:");
	console.log("================");
	console.log(`Total Procedures by Provider:`);
	console.log(`  - Dr. Ana Silva (Clínico Geral): 3 procedures`);
	console.log(`  - Dr. Carlos Santos (Odontologia): 3 procedures`);
	console.log(`  - Dra. Maria Oliveira (Oftalmologia): 3 procedures`);
	console.log(`  - Dr. João Ferreira (Dermatologia): 3 procedures`);
	console.log(`  - Dra. Beatriz Costa (Cardiologia): 4 procedures`);
	console.log(`\nSchedule Summary:`);
	console.log(`  - Provider 1: Mon-Fri 09:00-17:00 (5 slots)`);
	console.log(`  - Provider 2: Mon-Fri 08:00-18:00 (5 slots)`);
	console.log(`  - Provider 3: Tue-Sat 10:00-16:00 (5 slots)`);
	console.log(`  - Provider 4: Mon, Wed, Fri 09:00-17:00 (3 slots)`);
	console.log(`  - Provider 5: Mon-Thu 08:00-16:00 (4 slots)`);
	console.log(`\nConversations Summary:`);
	console.log(`  - 2 conversations with Provider 1 (Dr. Ana Silva)`);
	console.log(`  - 10 messages total (8 text, 2 files)`);
	console.log(
		`  - Messages include appointment references and file attachments`,
	);
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error("❌ Error during seed:", e);
		await prisma.$disconnect();
		process.exit(1);
	});
