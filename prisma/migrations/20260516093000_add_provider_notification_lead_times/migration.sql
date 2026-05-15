ALTER TYPE "NotificationType"
ADD VALUE IF NOT EXISTS 'APPOINTMENT_CONFIRMATION_REMINDER';

ALTER TABLE "users"
ADD COLUMN "appointment_confirmation_reminder_hours_before" INTEGER NOT NULL DEFAULT 24,
ADD COLUMN "appointment_reminder_hours_before" INTEGER NOT NULL DEFAULT 1;
