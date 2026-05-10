-- CreateEnum
CREATE TYPE "ScheduleExceptionType" AS ENUM ('DAY_OFF', 'TIME_BLOCK', 'SPECIAL_HOURS', 'EXTRA_SLOT');

-- CreateTable
CREATE TABLE "healthcare_provider_schedule_exceptions" (
    "id" TEXT NOT NULL,
    "healthcare_provider_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" "ScheduleExceptionType" NOT NULL,
    "start_time" TEXT,
    "end_time" TEXT,
    "reason" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "healthcare_provider_schedule_exceptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "healthcare_provider_schedule_exceptions_healthcare_provider_id_date_idx" ON "healthcare_provider_schedule_exceptions"("healthcare_provider_id", "date");

-- CreateIndex
CREATE INDEX "healthcare_provider_schedule_exceptions_type_idx" ON "healthcare_provider_schedule_exceptions"("type");

-- AddForeignKey
ALTER TABLE "healthcare_provider_schedule_exceptions" ADD CONSTRAINT "healthcare_provider_schedule_exceptions_healthcare_provider_id_fkey" FOREIGN KEY ("healthcare_provider_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
