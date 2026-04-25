CREATE TABLE "patient_profiles" (
  "id" TEXT NOT NULL,
  "full_name" TEXT NOT NULL,
  "date_of_birth" TIMESTAMP(3),
  "cpf" TEXT,
  "phone" TEXT,
  "email" TEXT,
  "address" TEXT,
  "gender" TEXT,
  "relationship_to_customer" TEXT,
  "notes" TEXT,
  "customer_owner_id" TEXT,
  "created_by_healthcare_provider_id" TEXT,
  "blood_type" TEXT,
  "medications" TEXT,
  "chronic_pain" TEXT,
  "pre_existing_conditions" TEXT,
  "allergies" TEXT,
  "surgeries" TEXT,
  "family_history" TEXT,
  "lifestyle_notes" TEXT,
  "emergency_contact_name" TEXT,
  "emergency_contact_phone" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "patient_profiles_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "patient_profiles_full_name_idx" ON "patient_profiles"("full_name");
CREATE INDEX "patient_profiles_phone_idx" ON "patient_profiles"("phone");
CREATE INDEX "patient_profiles_cpf_idx" ON "patient_profiles"("cpf");
CREATE INDEX "patient_profiles_customer_owner_id_idx" ON "patient_profiles"("customer_owner_id");
CREATE INDEX "patient_profiles_created_by_healthcare_provider_id_idx" ON "patient_profiles"("created_by_healthcare_provider_id");

ALTER TABLE "patient_profiles"
ADD CONSTRAINT "patient_profiles_customer_owner_id_fkey"
FOREIGN KEY ("customer_owner_id") REFERENCES "customers"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "patient_profiles"
ADD CONSTRAINT "patient_profiles_created_by_healthcare_provider_id_fkey"
FOREIGN KEY ("created_by_healthcare_provider_id") REFERENCES "healthcare_providers"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "appointments"
ALTER COLUMN "customer_id" DROP NOT NULL;

ALTER TABLE "appointments"
ADD COLUMN "patient_profile_id" TEXT;

CREATE INDEX "appointments_patient_profile_id_idx" ON "appointments"("patient_profile_id");

ALTER TABLE "appointments"
ADD CONSTRAINT "appointments_patient_profile_id_fkey"
FOREIGN KEY ("patient_profile_id") REFERENCES "patient_profiles"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
