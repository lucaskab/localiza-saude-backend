-- Move role-specific profile data into users and make all domain relations point
-- directly to users.id. This intentionally removes the old per-role profile
-- tables from the database model.

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "cpf" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "date_of_birth" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "address" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "display_name" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "document" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "birth_date" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "gender" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "languages" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "specialty" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "healthcare_provider_category" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "professional_id" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "license_council" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "license_state" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "license_document_key" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "license_document_file_name" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "license_document_mime_type" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "license_document_size" INTEGER;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "license_document_sha256" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "license_document_uploaded_at" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "verification_status" TEXT NOT NULL DEFAULT 'PENDING';
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "verified_at" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "bio" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "approach" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "education" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "certifications" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "years_of_experience" INTEGER;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "target_audiences" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "service_modalities" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "clinic_address" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "home_care_radius_km" INTEGER;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "accepted_insurance" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "payment_methods" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "cancellation_policy" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "clinic_photos" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "terms_accepted_at" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "lgpd_consent_at" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "professional_responsibility_accepted_at" TIMESTAMP(3);

UPDATE "users"
SET
  "cpf" = "customers"."cpf",
  "date_of_birth" = "customers"."date_of_birth",
  "address" = "customers"."address"
FROM "customers"
WHERE "customers"."user_id" = "users"."id";

UPDATE "users"
SET
  "display_name" = "healthcare_providers"."display_name",
  "document" = "healthcare_providers"."document",
  "birth_date" = "healthcare_providers"."birth_date",
  "gender" = "healthcare_providers"."gender",
  "languages" = "healthcare_providers"."languages",
  "specialty" = "healthcare_providers"."specialty",
  "healthcare_provider_category" = "healthcare_providers"."professional_category",
  "professional_id" = "healthcare_providers"."professional_id",
  "license_council" = "healthcare_providers"."license_council",
  "license_state" = "healthcare_providers"."license_state",
  "license_document_key" = "healthcare_providers"."license_document_key",
  "license_document_file_name" = "healthcare_providers"."license_document_file_name",
  "license_document_mime_type" = "healthcare_providers"."license_document_mime_type",
  "license_document_size" = "healthcare_providers"."license_document_size",
  "license_document_sha256" = "healthcare_providers"."license_document_sha256",
  "license_document_uploaded_at" = "healthcare_providers"."license_document_uploaded_at",
  "verification_status" = "healthcare_providers"."verification_status",
  "verified_at" = "healthcare_providers"."verified_at",
  "bio" = "healthcare_providers"."bio",
  "approach" = "healthcare_providers"."approach",
  "education" = "healthcare_providers"."education",
  "certifications" = "healthcare_providers"."certifications",
  "years_of_experience" = "healthcare_providers"."years_of_experience",
  "target_audiences" = "healthcare_providers"."target_audiences",
  "service_modalities" = "healthcare_providers"."service_modalities",
  "clinic_address" = "healthcare_providers"."clinic_address",
  "home_care_radius_km" = "healthcare_providers"."home_care_radius_km",
  "accepted_insurance" = "healthcare_providers"."accepted_insurance",
  "payment_methods" = "healthcare_providers"."payment_methods",
  "cancellation_policy" = "healthcare_providers"."cancellation_policy",
  "clinic_photos" = "healthcare_providers"."clinic_photos",
  "terms_accepted_at" = "healthcare_providers"."terms_accepted_at",
  "lgpd_consent_at" = "healthcare_providers"."lgpd_consent_at",
  "professional_responsibility_accepted_at" =
    "healthcare_providers"."professional_responsibility_accepted_at"
FROM "healthcare_providers"
WHERE "healthcare_providers"."user_id" = "users"."id";

ALTER TABLE "appointments" DROP CONSTRAINT IF EXISTS "appointments_customer_id_fkey";
ALTER TABLE "appointments" DROP CONSTRAINT IF EXISTS "appointments_healthcare_provider_id_fkey";
ALTER TABLE "conversations" DROP CONSTRAINT IF EXISTS "conversations_customer_id_fkey";
ALTER TABLE "conversations" DROP CONSTRAINT IF EXISTS "conversations_healthcare_provider_id_fkey";
ALTER TABLE "customer_favorite_providers" DROP CONSTRAINT IF EXISTS "customer_favorite_providers_customer_id_fkey";
ALTER TABLE "customer_favorite_providers" DROP CONSTRAINT IF EXISTS "customer_favorite_providers_healthcare_provider_id_fkey";
ALTER TABLE "customer_medical_records" DROP CONSTRAINT IF EXISTS "customer_medical_records_customer_id_fkey";
ALTER TABLE "healthcare_provider_categories" DROP CONSTRAINT IF EXISTS "healthcare_provider_categories_healthcare_provider_id_fkey";
ALTER TABLE "healthcare_provider_faqs" DROP CONSTRAINT IF EXISTS "healthcare_provider_faqs_healthcare_provider_id_fkey";
ALTER TABLE "healthcare_provider_schedules" DROP CONSTRAINT IF EXISTS "healthcare_provider_schedules_healthcare_provider_id_fkey";
ALTER TABLE "patient_profiles" DROP CONSTRAINT IF EXISTS "patient_profiles_customer_owner_id_fkey";
ALTER TABLE "patient_profiles" DROP CONSTRAINT IF EXISTS "patient_profiles_created_by_healthcare_provider_id_fkey";
ALTER TABLE "procedures" DROP CONSTRAINT IF EXISTS "procedures_healthcare_provider_id_fkey";
ALTER TABLE "ratings" DROP CONSTRAINT IF EXISTS "ratings_customer_id_fkey";
ALTER TABLE "ratings" DROP CONSTRAINT IF EXISTS "ratings_healthcare_provider_id_fkey";

UPDATE "appointments" SET "customer_id" = "customers"."user_id" FROM "customers" WHERE "appointments"."customer_id" = "customers"."id";
UPDATE "appointments" SET "healthcare_provider_id" = "healthcare_providers"."user_id" FROM "healthcare_providers" WHERE "appointments"."healthcare_provider_id" = "healthcare_providers"."id";
UPDATE "conversations" SET "customer_id" = "customers"."user_id" FROM "customers" WHERE "conversations"."customer_id" = "customers"."id";
UPDATE "conversations" SET "healthcare_provider_id" = "healthcare_providers"."user_id" FROM "healthcare_providers" WHERE "conversations"."healthcare_provider_id" = "healthcare_providers"."id";
UPDATE "customer_favorite_providers" SET "customer_id" = "customers"."user_id" FROM "customers" WHERE "customer_favorite_providers"."customer_id" = "customers"."id";
UPDATE "customer_favorite_providers" SET "healthcare_provider_id" = "healthcare_providers"."user_id" FROM "healthcare_providers" WHERE "customer_favorite_providers"."healthcare_provider_id" = "healthcare_providers"."id";
UPDATE "customer_medical_records" SET "customer_id" = "customers"."user_id" FROM "customers" WHERE "customer_medical_records"."customer_id" = "customers"."id";
UPDATE "healthcare_provider_categories" SET "healthcare_provider_id" = "healthcare_providers"."user_id" FROM "healthcare_providers" WHERE "healthcare_provider_categories"."healthcare_provider_id" = "healthcare_providers"."id";
UPDATE "healthcare_provider_faqs" SET "healthcare_provider_id" = "healthcare_providers"."user_id" FROM "healthcare_providers" WHERE "healthcare_provider_faqs"."healthcare_provider_id" = "healthcare_providers"."id";
UPDATE "healthcare_provider_schedules" SET "healthcare_provider_id" = "healthcare_providers"."user_id" FROM "healthcare_providers" WHERE "healthcare_provider_schedules"."healthcare_provider_id" = "healthcare_providers"."id";
UPDATE "patient_profiles" SET "customer_owner_id" = "customers"."user_id" FROM "customers" WHERE "patient_profiles"."customer_owner_id" = "customers"."id";
UPDATE "patient_profiles" SET "created_by_healthcare_provider_id" = "healthcare_providers"."user_id" FROM "healthcare_providers" WHERE "patient_profiles"."created_by_healthcare_provider_id" = "healthcare_providers"."id";
UPDATE "procedures" SET "healthcare_provider_id" = "healthcare_providers"."user_id" FROM "healthcare_providers" WHERE "procedures"."healthcare_provider_id" = "healthcare_providers"."id";
UPDATE "ratings" SET "customer_id" = "customers"."user_id" FROM "customers" WHERE "ratings"."customer_id" = "customers"."id";
UPDATE "ratings" SET "healthcare_provider_id" = "healthcare_providers"."user_id" FROM "healthcare_providers" WHERE "ratings"."healthcare_provider_id" = "healthcare_providers"."id";

DROP TABLE "customers";
DROP TABLE "healthcare_providers";

ALTER TABLE "appointments" ADD CONSTRAINT "appointments_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_healthcare_provider_id_fkey" FOREIGN KEY ("healthcare_provider_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_healthcare_provider_id_fkey" FOREIGN KEY ("healthcare_provider_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "customer_favorite_providers" ADD CONSTRAINT "customer_favorite_providers_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "customer_favorite_providers" ADD CONSTRAINT "customer_favorite_providers_healthcare_provider_id_fkey" FOREIGN KEY ("healthcare_provider_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "customer_medical_records" ADD CONSTRAINT "customer_medical_records_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "healthcare_provider_categories" ADD CONSTRAINT "healthcare_provider_categories_healthcare_provider_id_fkey" FOREIGN KEY ("healthcare_provider_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "healthcare_provider_faqs" ADD CONSTRAINT "healthcare_provider_faqs_healthcare_provider_id_fkey" FOREIGN KEY ("healthcare_provider_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "healthcare_provider_schedules" ADD CONSTRAINT "healthcare_provider_schedules_healthcare_provider_id_fkey" FOREIGN KEY ("healthcare_provider_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "patient_profiles" ADD CONSTRAINT "patient_profiles_customer_owner_id_fkey" FOREIGN KEY ("customer_owner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "patient_profiles" ADD CONSTRAINT "patient_profiles_created_by_healthcare_provider_id_fkey" FOREIGN KEY ("created_by_healthcare_provider_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "procedures" ADD CONSTRAINT "procedures_healthcare_provider_id_fkey" FOREIGN KEY ("healthcare_provider_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_healthcare_provider_id_fkey" FOREIGN KEY ("healthcare_provider_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
