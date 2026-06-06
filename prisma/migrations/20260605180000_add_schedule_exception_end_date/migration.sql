-- Add end date support to schedule exceptions
ALTER TABLE "healthcare_provider_schedule_exceptions"
ADD COLUMN "end_date" TIMESTAMP(3);

CREATE INDEX "hps_exc_provider_end_date_idx"
ON "healthcare_provider_schedule_exceptions"("healthcare_provider_id", "end_date");
