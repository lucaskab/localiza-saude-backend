-- CreateEnum
CREATE TYPE "AddressOwnerType" AS ENUM ('USER', 'CLINIC');

-- CreateEnum
CREATE TYPE "AddressType" AS ENUM ('HOME', 'BILLING', 'CLINIC', 'WORK', 'OTHER');

-- CreateEnum
CREATE TYPE "OnboardingStep" AS ENUM ('ROLE', 'CUSTOMER_PROFILE', 'CUSTOMER_MEDICAL', 'COMPLETED');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "onboarding_step" "OnboardingStep" NOT NULL DEFAULT 'COMPLETED';

UPDATE "users"
SET "onboarding_step" = CASE
  WHEN "onboarding_completed" = false THEN 'ROLE'::"OnboardingStep"
  ELSE 'COMPLETED'::"OnboardingStep"
END;

-- CreateTable
CREATE TABLE "addresses" (
    "id" TEXT NOT NULL,
    "owner_type" "AddressOwnerType" NOT NULL,
    "owner_id" TEXT NOT NULL,
    "type" "AddressType" NOT NULL DEFAULT 'HOME',
    "is_primary" BOOLEAN NOT NULL DEFAULT true,
    "label" TEXT,
    "country_code" TEXT NOT NULL DEFAULT 'BR',
    "postal_code" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "neighborhood" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "complement" TEXT,
    "reference" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "formatted_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "addresses_owner_type_owner_id_idx" ON "addresses"("owner_type", "owner_id");
CREATE INDEX "addresses_postal_code_idx" ON "addresses"("postal_code");
CREATE INDEX "addresses_city_state_idx" ON "addresses"("city", "state");

-- Migrate legacy customer addresses
INSERT INTO "addresses" (
    "id",
    "owner_type",
    "owner_id",
    "type",
    "is_primary",
    "country_code",
    "postal_code",
    "state",
    "city",
    "neighborhood",
    "street",
    "number",
    "formatted_address",
    "updated_at"
)
SELECT
    gen_random_uuid()::text,
    'USER'::"AddressOwnerType",
    "id",
    'HOME'::"AddressType",
    true,
    'BR',
    '00000000',
    'SP',
    'Não informado',
    'Não informado',
    "address",
    'S/N',
    "address",
    CURRENT_TIMESTAMP
FROM "users"
WHERE "address" IS NOT NULL
  AND btrim("address") <> ''
  AND "role" = 'CUSTOMER';

-- Migrate legacy clinic addresses
INSERT INTO "addresses" (
    "id",
    "owner_type",
    "owner_id",
    "type",
    "is_primary",
    "country_code",
    "postal_code",
    "state",
    "city",
    "neighborhood",
    "street",
    "number",
    "latitude",
    "longitude",
    "formatted_address",
    "updated_at"
)
SELECT
    gen_random_uuid()::text,
    'CLINIC'::"AddressOwnerType",
    "id",
    'CLINIC'::"AddressType",
    true,
    'BR',
    '00000000',
    'SP',
    'Não informado',
    'Não informado',
    COALESCE("address", 'Não informado'),
    'S/N',
    "latitude",
    "longitude",
    "address",
    CURRENT_TIMESTAMP
FROM "clinics"
WHERE "address" IS NOT NULL
  AND btrim("address") <> '';
