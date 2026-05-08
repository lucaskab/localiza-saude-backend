CREATE TYPE "AppointmentRescheduleRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'CANCELLED');

CREATE TABLE "appointment_reschedule_requests" (
    "id" TEXT NOT NULL,
    "appointment_id" TEXT NOT NULL,
    "requested_by_user_id" TEXT NOT NULL,
    "proposed_scheduled_at" TIMESTAMP(3) NOT NULL,
    "status" "AppointmentRescheduleRequestStatus" NOT NULL DEFAULT 'PENDING',
    "reason" TEXT,
    "responded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointment_reschedule_requests_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "appointment_reschedule_requests_appointment_id_idx" ON "appointment_reschedule_requests"("appointment_id");
CREATE INDEX "appointment_reschedule_requests_requested_by_user_id_idx" ON "appointment_reschedule_requests"("requested_by_user_id");
CREATE INDEX "appointment_reschedule_requests_status_idx" ON "appointment_reschedule_requests"("status");

ALTER TABLE "appointment_reschedule_requests"
ADD CONSTRAINT "appointment_reschedule_requests_appointment_id_fkey"
FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "appointment_reschedule_requests"
ADD CONSTRAINT "appointment_reschedule_requests_requested_by_user_id_fkey"
FOREIGN KEY ("requested_by_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
