CREATE TABLE "customer_medical_records" (
  "id" TEXT NOT NULL,
  "customer_id" TEXT NOT NULL,
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

  CONSTRAINT "customer_medical_records_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "customer_medical_records_customer_id_key" ON "customer_medical_records"("customer_id");

CREATE INDEX "customer_medical_records_customer_id_idx" ON "customer_medical_records"("customer_id");

ALTER TABLE "customer_medical_records"
ADD CONSTRAINT "customer_medical_records_customer_id_fkey"
FOREIGN KEY ("customer_id") REFERENCES "customers"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
