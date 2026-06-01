-- CreateTable
CREATE TABLE "health_insurance_plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "health_insurance_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_health_insurance_plans" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "health_insurance_plan_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_health_insurance_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "healthcare_provider_health_insurance_plans" (
    "id" TEXT NOT NULL,
    "healthcare_provider_id" TEXT NOT NULL,
    "health_insurance_plan_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "healthcare_provider_health_insurance_plans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "health_insurance_plans_name_key" ON "health_insurance_plans"("name");

-- CreateIndex
CREATE INDEX "health_insurance_plans_active_idx" ON "health_insurance_plans"("active");

-- CreateIndex
CREATE INDEX "health_insurance_plans_name_idx" ON "health_insurance_plans"("name");

-- CreateIndex
CREATE INDEX "user_health_insurance_plans_user_id_idx" ON "user_health_insurance_plans"("user_id");

-- CreateIndex
CREATE INDEX "user_health_insurance_plans_health_insurance_plan_id_idx" ON "user_health_insurance_plans"("health_insurance_plan_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_health_insurance_plans_user_id_health_insurance_plan_id_key" ON "user_health_insurance_plans"("user_id", "health_insurance_plan_id");

-- CreateIndex
CREATE INDEX "hp_health_insurance_provider_id_idx" ON "healthcare_provider_health_insurance_plans"("healthcare_provider_id");

-- CreateIndex
CREATE INDEX "hp_health_insurance_plan_id_idx" ON "healthcare_provider_health_insurance_plans"("health_insurance_plan_id");

-- CreateIndex
CREATE UNIQUE INDEX "hp_health_insurance_provider_plan_key" ON "healthcare_provider_health_insurance_plans"("healthcare_provider_id", "health_insurance_plan_id");

-- AddForeignKey
ALTER TABLE "user_health_insurance_plans" ADD CONSTRAINT "user_health_insurance_plans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_health_insurance_plans" ADD CONSTRAINT "user_health_insurance_plans_health_insurance_plan_id_fkey" FOREIGN KEY ("health_insurance_plan_id") REFERENCES "health_insurance_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "healthcare_provider_health_insurance_plans" ADD CONSTRAINT "healthcare_provider_health_insurance_plans_healthcare_provider_id_fkey" FOREIGN KEY ("healthcare_provider_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "healthcare_provider_health_insurance_plans" ADD CONSTRAINT "healthcare_provider_health_insurance_plans_health_insurance_plan_id_fkey" FOREIGN KEY ("health_insurance_plan_id") REFERENCES "health_insurance_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "accepted_insurance";
