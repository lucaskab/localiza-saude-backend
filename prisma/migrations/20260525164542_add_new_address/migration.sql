/*
  Warnings:

  - You are about to drop the column `enabled` on the `notification_preferences` table. All the data in the column will be lost.
  - You are about to drop the `_ClinicEmployees` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ClinicEmployees" DROP CONSTRAINT "_ClinicEmployees_A_fkey";

-- DropForeignKey
ALTER TABLE "_ClinicEmployees" DROP CONSTRAINT "_ClinicEmployees_B_fkey";

-- AlterTable
ALTER TABLE "notification_deliveries" ALTER COLUMN "channel" DROP DEFAULT;

-- AlterTable
ALTER TABLE "notification_preferences" DROP COLUMN "enabled";

-- DropTable
DROP TABLE "_ClinicEmployees";

-- RenameForeignKey
ALTER TABLE "healthcare_provider_schedule_exceptions" RENAME CONSTRAINT "healthcare_provider_schedule_exceptions_healthcare_provider_id_" TO "healthcare_provider_schedule_exceptions_healthcare_provide_fkey";

-- RenameForeignKey
ALTER TABLE "provider_verification_document_access_logs" RENAME CONSTRAINT "provider_verification_document_access_logs_healthcare_provider_" TO "provider_verification_document_access_logs_healthcare_prov_fkey";

-- RenameIndex
ALTER INDEX "appointment_evolution_notes_customer_id_healthcare_provider_id_" RENAME TO "appointment_evolution_notes_customer_id_healthcare_provider_idx";

-- RenameIndex
ALTER INDEX "appointment_evolution_notes_healthcare_provider_id_created_at_i" RENAME TO "appointment_evolution_notes_healthcare_provider_id_created__idx";

-- RenameIndex
ALTER INDEX "appointment_evolution_notes_patient_profile_id_healthcare_provi" RENAME TO "appointment_evolution_notes_patient_profile_id_healthcare_p_idx";

-- RenameIndex
ALTER INDEX "appointment_recurring_series_healthcare_provider_id_is_act_idx" RENAME TO "appointment_recurring_series_healthcare_provider_id_is_acti_idx";

-- RenameIndex
ALTER INDEX "appointment_recurring_series_procedures_series_id_procedure_i_k" RENAME TO "appointment_recurring_series_procedures_series_id_procedure_key";

-- RenameIndex
ALTER INDEX "appointment_waitlist_entries_customer_id_healthcare_provider_id" RENAME TO "appointment_waitlist_entries_customer_id_healthcare_provide_key";

-- RenameIndex
ALTER INDEX "appointment_waitlist_entries_healthcare_provider_id_status_desi" RENAME TO "appointment_waitlist_entries_healthcare_provider_id_status__idx";

-- RenameIndex
ALTER INDEX "appointment_waitlist_entry_procedures_waitlist_entry_id_procedu" RENAME TO "appointment_waitlist_entry_procedures_waitlist_entry_id_pro_key";

-- RenameIndex
ALTER INDEX "healthcare_provider_schedule_exceptions_healthcare_provider_id_" RENAME TO "healthcare_provider_schedule_exceptions_healthcare_provider_idx";

-- RenameIndex
ALTER INDEX "notification_deliveries_user_id_type_channel_dedupe_key" RENAME TO "notification_deliveries_user_id_type_channel_dedupe_key_key";

-- RenameIndex
ALTER INDEX "provider_verification_document_access_logs_healthcare_provider_" RENAME TO "provider_verification_document_access_logs_healthcare_provi_idx";
