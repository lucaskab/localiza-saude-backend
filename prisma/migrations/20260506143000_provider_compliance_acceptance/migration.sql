ALTER TABLE "healthcare_providers"
ADD COLUMN "terms_accepted_at" TIMESTAMP(3),
ADD COLUMN "lgpd_consent_at" TIMESTAMP(3),
ADD COLUMN "professional_responsibility_accepted_at" TIMESTAMP(3);
