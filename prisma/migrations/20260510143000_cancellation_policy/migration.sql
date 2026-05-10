CREATE TYPE "CancellationPenaltyType" AS ENUM ('FIXED', 'PERCENTAGE');

ALTER TABLE "users"
ADD COLUMN "cancellation_policy_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "cancellation_policy_hours_before" INTEGER,
ADD COLUMN "cancellation_policy_penalty_type" "CancellationPenaltyType",
ADD COLUMN "cancellation_policy_fixed_fee_cents" INTEGER,
ADD COLUMN "cancellation_policy_percentage" INTEGER,
ADD COLUMN "cancellation_policy_requires_justification" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "appointments"
ADD COLUMN "cancellation_reason" TEXT,
ADD COLUMN "cancellation_fee_cents" INTEGER,
ADD COLUMN "cancellation_policy_applied_at" TIMESTAMP(3),
ADD COLUMN "cancelled_at" TIMESTAMP(3),
ADD COLUMN "cancelled_by_user_id" TEXT;

CREATE INDEX "appointments_cancelled_by_user_id_idx" ON "appointments"("cancelled_by_user_id");

ALTER TABLE "appointments"
ADD CONSTRAINT "appointments_cancelled_by_user_id_fkey"
FOREIGN KEY ("cancelled_by_user_id") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
