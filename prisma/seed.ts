import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Delete all data before seeding
  await prisma.clinicUser.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.clinic.deleteMany({});

  // Create clinics
  const clinic1 = await prisma.clinic.create({
    data: {
      name: "Health First Clinic",
      phone: "123-456-7890",
      email: "contact@healthfirst.com",
      type: "MEDICAL",
    },
  });

  const clinic2 = await prisma.clinic.create({
    data: {
      name: "Bright Smiles Dental",
      phone: "987-654-3210",
      email: "info@brightsmiles.com",
      type: "DENTAL",
    },
  });

  // Create users
  const provider1 = await prisma.user.create({
    data: {
      firstName: "Alice",
      lastName: "Smith",
      phone: "111-222-3333",
      email: "alice@provider.com",
      role: "HEALTHCARE_PROVIDER",
    },
  });

  const provider2 = await prisma.user.create({
    data: {
      firstName: "Bob",
      lastName: "Jones",
      phone: "444-555-6666",
      email: "bob@provider.com",
      role: "HEALTHCARE_PROVIDER",
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      firstName: "Charlie",
      lastName: "Brown",
      phone: "777-888-9999",
      email: "charlie@customer.com",
      role: "CUSTOMER",
    },
  });

  // Link providers to clinics
  await prisma.clinicUser.createMany({
    data: [
      { userId: provider1.id, clinicId: clinic1.id },
      { userId: provider2.id, clinicId: clinic1.id },
      { userId: provider2.id, clinicId: clinic2.id },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
