DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'AppointmentEvolutionStatus'
  ) THEN
    CREATE TYPE "AppointmentEvolutionStatus" AS ENUM (
      'IMPROVED',
      'STABLE',
      'WORSENED'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "appointment_evolution_notes" (
  "id" TEXT NOT NULL,
  "appointment_id" TEXT NOT NULL,
  "customer_id" TEXT,
  "patient_profile_id" TEXT,
  "healthcare_provider_id" TEXT NOT NULL,
  "subjective" TEXT,
  "objective" TEXT,
  "assessment" TEXT,
  "plan" TEXT,
  "pain_level" INTEGER,
  "pain_location" TEXT,
  "evolution_status" "AppointmentEvolutionStatus",
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "appointment_evolution_notes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "appointment_evolution_notes_appointment_id_key"
ON "appointment_evolution_notes"("appointment_id");

CREATE INDEX IF NOT EXISTS "appointment_evolution_notes_customer_id_healthcare_provider_id_created_at_idx"
ON "appointment_evolution_notes"("customer_id", "healthcare_provider_id", "created_at");

CREATE INDEX IF NOT EXISTS "appointment_evolution_notes_patient_profile_id_healthcare_provider_id_created_at_idx"
ON "appointment_evolution_notes"("patient_profile_id", "healthcare_provider_id", "created_at");

CREATE INDEX IF NOT EXISTS "appointment_evolution_notes_healthcare_provider_id_created_at_idx"
ON "appointment_evolution_notes"("healthcare_provider_id", "created_at");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'appointment_evolution_notes_appointment_id_fkey'
  ) THEN
    ALTER TABLE "appointment_evolution_notes"
      ADD CONSTRAINT "appointment_evolution_notes_appointment_id_fkey"
      FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'appointment_evolution_notes_customer_id_fkey'
  ) THEN
    ALTER TABLE "appointment_evolution_notes"
      ADD CONSTRAINT "appointment_evolution_notes_customer_id_fkey"
      FOREIGN KEY ("customer_id") REFERENCES "users"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'appointment_evolution_notes_patient_profile_id_fkey'
  ) THEN
    ALTER TABLE "appointment_evolution_notes"
      ADD CONSTRAINT "appointment_evolution_notes_patient_profile_id_fkey"
      FOREIGN KEY ("patient_profile_id") REFERENCES "patient_profiles"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'appointment_evolution_notes_healthcare_provider_id_fkey'
  ) THEN
    ALTER TABLE "appointment_evolution_notes"
      ADD CONSTRAINT "appointment_evolution_notes_healthcare_provider_id_fkey"
      FOREIGN KEY ("healthcare_provider_id") REFERENCES "users"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
