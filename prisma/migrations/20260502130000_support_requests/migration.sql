-- CreateEnum
CREATE TYPE "SupportRequestType" AS ENUM ('ACCOUNT_DELETION', 'DATA_DELETION', 'PROBLEM_REPORT', 'FEEDBACK', 'SUPPORT_CONTACT');

-- CreateEnum
CREATE TYPE "SupportRequestStatus" AS ENUM ('OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED');

-- CreateTable
CREATE TABLE "support_requests" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "SupportRequestType" NOT NULL,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "contact_email" TEXT,
    "app_version" TEXT,
    "platform" TEXT,
    "environment" TEXT,
    "status" "SupportRequestStatus" NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "support_requests_user_id_idx" ON "support_requests"("user_id");

-- CreateIndex
CREATE INDEX "support_requests_type_idx" ON "support_requests"("type");

-- CreateIndex
CREATE INDEX "support_requests_status_idx" ON "support_requests"("status");

-- AddForeignKey
ALTER TABLE "support_requests" ADD CONSTRAINT "support_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
