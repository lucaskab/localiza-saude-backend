CREATE TABLE "healthcare_provider_faqs" (
    "id" TEXT NOT NULL,
    "healthcare_provider_id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "healthcare_provider_faqs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "healthcare_provider_faqs_healthcare_provider_id_idx" ON "healthcare_provider_faqs"("healthcare_provider_id");

ALTER TABLE "healthcare_provider_faqs"
ADD CONSTRAINT "healthcare_provider_faqs_healthcare_provider_id_fkey"
FOREIGN KEY ("healthcare_provider_id") REFERENCES "healthcare_providers"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
