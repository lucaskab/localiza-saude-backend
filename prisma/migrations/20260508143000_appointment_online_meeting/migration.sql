ALTER TABLE "appointments"
ADD COLUMN IF NOT EXISTS "online_meeting_url" TEXT,
ADD COLUMN IF NOT EXISTS "online_meeting_provider" TEXT,
ADD COLUMN IF NOT EXISTS "online_meeting_external_id" TEXT,
ADD COLUMN IF NOT EXISTS "online_meeting_created_at" TIMESTAMP(3);
