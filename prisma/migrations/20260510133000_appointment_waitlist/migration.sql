-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'WAITLIST_SLOT_AVAILABLE';

-- CreateEnum
CREATE TYPE "AppointmentWaitlistStatus" AS ENUM ('ACTIVE', 'CANCELLED');

-- CreateTable
CREATE TABLE "appointment_waitlist_entries" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "healthcare_provider_id" TEXT NOT NULL,
    "desired_scheduled_at" TIMESTAMP(3) NOT NULL,
    "status" "AppointmentWaitlistStatus" NOT NULL DEFAULT 'ACTIVE',
    "last_notified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointment_waitlist_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointment_waitlist_entry_procedures" (
    "id" TEXT NOT NULL,
    "waitlist_entry_id" TEXT NOT NULL,
    "procedure_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appointment_waitlist_entry_procedures_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "appointment_waitlist_entries_customer_id_healthcare_provider_id_desired_scheduled_at_key" ON "appointment_waitlist_entries"("customer_id", "healthcare_provider_id", "desired_scheduled_at");

-- CreateIndex
CREATE INDEX "appointment_waitlist_entries_customer_id_status_idx" ON "appointment_waitlist_entries"("customer_id", "status");

-- CreateIndex
CREATE INDEX "appointment_waitlist_entries_healthcare_provider_id_status_desired_scheduled_at_idx" ON "appointment_waitlist_entries"("healthcare_provider_id", "status", "desired_scheduled_at");

-- CreateIndex
CREATE UNIQUE INDEX "appointment_waitlist_entry_procedures_waitlist_entry_id_procedure_id_key" ON "appointment_waitlist_entry_procedures"("waitlist_entry_id", "procedure_id");

-- CreateIndex
CREATE INDEX "appointment_waitlist_entry_procedures_procedure_id_idx" ON "appointment_waitlist_entry_procedures"("procedure_id");

-- AddForeignKey
ALTER TABLE "appointment_waitlist_entries" ADD CONSTRAINT "appointment_waitlist_entries_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment_waitlist_entries" ADD CONSTRAINT "appointment_waitlist_entries_healthcare_provider_id_fkey" FOREIGN KEY ("healthcare_provider_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment_waitlist_entry_procedures" ADD CONSTRAINT "appointment_waitlist_entry_procedures_waitlist_entry_id_fkey" FOREIGN KEY ("waitlist_entry_id") REFERENCES "appointment_waitlist_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment_waitlist_entry_procedures" ADD CONSTRAINT "appointment_waitlist_entry_procedures_procedure_id_fkey" FOREIGN KEY ("procedure_id") REFERENCES "procedures"("id") ON DELETE CASCADE ON UPDATE CASCADE;
