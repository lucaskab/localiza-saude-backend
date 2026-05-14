-- Alter users with provider booking window
ALTER TABLE "users"
ADD COLUMN "booking_availability_days" INTEGER NOT NULL DEFAULT 60;

-- Create recurring appointment series
CREATE TABLE "appointment_recurring_series" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT,
    "patient_profile_id" TEXT,
    "healthcare_provider_id" TEXT NOT NULL,
    "created_by_user_id" TEXT NOT NULL,
    "service_modality" TEXT NOT NULL DEFAULT 'IN_PERSON',
    "notes" TEXT,
    "starts_on" TIMESTAMP(3) NOT NULL,
    "ends_on" TIMESTAMP(3),
    "is_indefinite" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "generated_until" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointment_recurring_series_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "appointment_recurring_series_rules" (
    "id" TEXT NOT NULL,
    "series_id" TEXT NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "start_time" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointment_recurring_series_rules_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "appointment_recurring_series_procedures" (
    "id" TEXT NOT NULL,
    "series_id" TEXT NOT NULL,
    "procedure_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appointment_recurring_series_procedures_pkey" PRIMARY KEY ("id")
);

-- Alter appointments with recurring metadata
ALTER TABLE "appointments"
ADD COLUMN "recurring_series_id" TEXT,
ADD COLUMN "recurring_rule_id" TEXT,
ADD COLUMN "recurring_generated_at" TIMESTAMP(3);

-- Indexes
CREATE INDEX "appointment_recurring_series_customer_id_is_active_idx"
ON "appointment_recurring_series"("customer_id", "is_active");

CREATE INDEX "appointment_recurring_series_patient_profile_id_idx"
ON "appointment_recurring_series"("patient_profile_id");

CREATE INDEX "appointment_recurring_series_healthcare_provider_id_is_act_idx"
ON "appointment_recurring_series"("healthcare_provider_id", "is_active");

CREATE INDEX "appointment_recurring_series_created_by_user_id_idx"
ON "appointment_recurring_series"("created_by_user_id");

CREATE UNIQUE INDEX "appointment_recurring_series_rules_series_id_day_of_week_st_key"
ON "appointment_recurring_series_rules"("series_id", "day_of_week", "start_time");

CREATE INDEX "appointment_recurring_series_rules_series_id_day_of_week_idx"
ON "appointment_recurring_series_rules"("series_id", "day_of_week");

CREATE UNIQUE INDEX "appointment_recurring_series_procedures_series_id_procedure_i_key"
ON "appointment_recurring_series_procedures"("series_id", "procedure_id");

CREATE INDEX "appointment_recurring_series_procedures_procedure_id_idx"
ON "appointment_recurring_series_procedures"("procedure_id");

CREATE INDEX "appointments_recurring_series_id_idx"
ON "appointments"("recurring_series_id");

CREATE INDEX "appointments_recurring_rule_id_idx"
ON "appointments"("recurring_rule_id");

-- Foreign keys
ALTER TABLE "appointment_recurring_series"
ADD CONSTRAINT "appointment_recurring_series_customer_id_fkey"
FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "appointment_recurring_series"
ADD CONSTRAINT "appointment_recurring_series_patient_profile_id_fkey"
FOREIGN KEY ("patient_profile_id") REFERENCES "patient_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "appointment_recurring_series"
ADD CONSTRAINT "appointment_recurring_series_healthcare_provider_id_fkey"
FOREIGN KEY ("healthcare_provider_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "appointment_recurring_series"
ADD CONSTRAINT "appointment_recurring_series_created_by_user_id_fkey"
FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "appointment_recurring_series_rules"
ADD CONSTRAINT "appointment_recurring_series_rules_series_id_fkey"
FOREIGN KEY ("series_id") REFERENCES "appointment_recurring_series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "appointment_recurring_series_procedures"
ADD CONSTRAINT "appointment_recurring_series_procedures_series_id_fkey"
FOREIGN KEY ("series_id") REFERENCES "appointment_recurring_series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "appointment_recurring_series_procedures"
ADD CONSTRAINT "appointment_recurring_series_procedures_procedure_id_fkey"
FOREIGN KEY ("procedure_id") REFERENCES "procedures"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "appointments"
ADD CONSTRAINT "appointments_recurring_series_id_fkey"
FOREIGN KEY ("recurring_series_id") REFERENCES "appointment_recurring_series"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "appointments"
ADD CONSTRAINT "appointments_recurring_rule_id_fkey"
FOREIGN KEY ("recurring_rule_id") REFERENCES "appointment_recurring_series_rules"("id") ON DELETE SET NULL ON UPDATE CASCADE;
