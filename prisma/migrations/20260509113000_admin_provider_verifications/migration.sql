ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'ADMIN';

CREATE TYPE "ProviderVerificationReviewStatus" AS ENUM ('APPROVED', 'REJECTED');

ALTER TABLE "users"
ADD COLUMN "verification_rejection_reason" TEXT,
ADD COLUMN "verified_by_user_id" TEXT;

CREATE TABLE "provider_verification_reviews" (
    "id" TEXT NOT NULL,
    "healthcare_provider_id" TEXT NOT NULL,
    "reviewer_user_id" TEXT NOT NULL,
    "status" "ProviderVerificationReviewStatus" NOT NULL,
    "reason" TEXT,
    "internal_notes" TEXT,
    "document_key" TEXT,
    "document_sha256" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "provider_verification_reviews_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "provider_verification_document_access_logs" (
    "id" TEXT NOT NULL,
    "healthcare_provider_id" TEXT NOT NULL,
    "admin_user_id" TEXT NOT NULL,
    "document_key" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "provider_verification_document_access_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "users_verified_by_user_id_idx" ON "users"("verified_by_user_id");
CREATE INDEX "provider_verification_reviews_healthcare_provider_id_idx" ON "provider_verification_reviews"("healthcare_provider_id");
CREATE INDEX "provider_verification_reviews_reviewer_user_id_idx" ON "provider_verification_reviews"("reviewer_user_id");
CREATE INDEX "provider_verification_reviews_status_idx" ON "provider_verification_reviews"("status");
CREATE INDEX "provider_verification_document_access_logs_healthcare_provider_id_idx" ON "provider_verification_document_access_logs"("healthcare_provider_id");
CREATE INDEX "provider_verification_document_access_logs_admin_user_id_idx" ON "provider_verification_document_access_logs"("admin_user_id");

ALTER TABLE "users"
ADD CONSTRAINT "users_verified_by_user_id_fkey"
FOREIGN KEY ("verified_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "provider_verification_reviews"
ADD CONSTRAINT "provider_verification_reviews_healthcare_provider_id_fkey"
FOREIGN KEY ("healthcare_provider_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "provider_verification_reviews"
ADD CONSTRAINT "provider_verification_reviews_reviewer_user_id_fkey"
FOREIGN KEY ("reviewer_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "provider_verification_document_access_logs"
ADD CONSTRAINT "provider_verification_document_access_logs_healthcare_provider_id_fkey"
FOREIGN KEY ("healthcare_provider_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "provider_verification_document_access_logs"
ADD CONSTRAINT "provider_verification_document_access_logs_admin_user_id_fkey"
FOREIGN KEY ("admin_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
