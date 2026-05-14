-- Fix missing user column required by Better Auth user queries
ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "birthday_greeting_email_enabled" BOOLEAN NOT NULL DEFAULT false;

-- Align notification type enum with current Prisma schema
ALTER TYPE "NotificationType"
ADD VALUE IF NOT EXISTS 'CUSTOMER_BIRTHDAY_GREETING';

-- Create notification channel enum when missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'NotificationChannel'
  ) THEN
    CREATE TYPE "NotificationChannel" AS ENUM ('PUSH', 'EMAIL');
  END IF;
END $$;

-- Expand notification preferences to channel-specific settings
ALTER TABLE "notification_preferences"
ADD COLUMN IF NOT EXISTS "push_enabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS "email_enabled" BOOLEAN NOT NULL DEFAULT false;

UPDATE "notification_preferences"
SET "push_enabled" = COALESCE("enabled", true)
WHERE "push_enabled" IS DISTINCT FROM COALESCE("enabled", true);

-- Expand notification deliveries with channel/dedupe support
ALTER TABLE "notification_deliveries"
ADD COLUMN IF NOT EXISTS "channel" "NotificationChannel" NOT NULL DEFAULT 'PUSH',
ADD COLUMN IF NOT EXISTS "dedupe_key" TEXT;

DROP INDEX IF EXISTS "notification_deliveries_type_status_idx";
CREATE INDEX IF NOT EXISTS "notification_deliveries_type_status_channel_idx"
ON "notification_deliveries"("type", "status", "channel");

DROP INDEX IF EXISTS "notification_deliveries_user_id_type_appointment_id_key";
CREATE UNIQUE INDEX IF NOT EXISTS "notification_deliveries_user_id_type_channel_dedupe_key"
ON "notification_deliveries"("user_id", "type", "channel", "dedupe_key");
