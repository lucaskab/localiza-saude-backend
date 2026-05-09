-- Add staff accounts and clinic-level RBAC.
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'STAFF';

ALTER TABLE "clinics" ADD COLUMN IF NOT EXISTS "address" TEXT;
ALTER TABLE "clinics" ALTER COLUMN "latitude" DROP NOT NULL;
ALTER TABLE "clinics" ALTER COLUMN "longitude" DROP NOT NULL;

CREATE TYPE "ClinicEmployeeRole" AS ENUM ('OWNER', 'PROVIDER', 'STAFF');

CREATE TYPE "ClinicPermission" AS ENUM (
    'MANAGE_PROVIDER_PROFILE',
    'MANAGE_PROVIDER_SCHEDULE',
    'MANAGE_APPOINTMENTS',
    'MANAGE_PROCEDURES',
    'VIEW_PATIENTS',
    'MANAGE_CLINIC_INFO',
    'MANAGE_STAFF'
);

CREATE TABLE "clinic_employees" (
    "id" TEXT NOT NULL,
    "clinic_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "ClinicEmployeeRole" NOT NULL,
    "permissions" "ClinicPermission"[] NOT NULL DEFAULT ARRAY[]::"ClinicPermission"[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinic_employees_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "clinic_employees_clinic_id_user_id_key" ON "clinic_employees"("clinic_id", "user_id");
CREATE INDEX "clinic_employees_clinic_id_idx" ON "clinic_employees"("clinic_id");
CREATE INDEX "clinic_employees_user_id_idx" ON "clinic_employees"("user_id");
CREATE INDEX "clinic_employees_role_idx" ON "clinic_employees"("role");

ALTER TABLE "clinic_employees" ADD CONSTRAINT "clinic_employees_clinic_id_fkey"
    FOREIGN KEY ("clinic_id") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "clinic_employees" ADD CONSTRAINT "clinic_employees_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "clinic_employees" (
    "id",
    "clinic_id",
    "user_id",
    "role",
    "permissions",
    "active",
    "created_at",
    "updated_at"
)
SELECT
    'cm_owner_' || md5("id" || "owner_id"),
    "id",
    "owner_id",
    'OWNER'::"ClinicEmployeeRole",
    ARRAY[
        'MANAGE_PROVIDER_PROFILE',
        'MANAGE_PROVIDER_SCHEDULE',
        'MANAGE_APPOINTMENTS',
        'MANAGE_PROCEDURES',
        'VIEW_PATIENTS',
        'MANAGE_CLINIC_INFO',
        'MANAGE_STAFF'
    ]::"ClinicPermission"[],
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "clinics"
ON CONFLICT ("clinic_id", "user_id") DO NOTHING;

INSERT INTO "clinic_employees" (
    "id",
    "clinic_id",
    "user_id",
    "role",
    "permissions",
    "active",
    "created_at",
    "updated_at"
)
SELECT
    'cm_employee_' || md5("A" || "B"),
    "A",
    "B",
    CASE
        WHEN "users"."role" = 'HEALTHCARE_PROVIDER' THEN 'PROVIDER'::"ClinicEmployeeRole"
        ELSE 'STAFF'::"ClinicEmployeeRole"
    END,
    CASE
        WHEN "users"."role" = 'HEALTHCARE_PROVIDER' THEN ARRAY[
            'MANAGE_PROVIDER_PROFILE',
            'MANAGE_PROVIDER_SCHEDULE',
            'MANAGE_APPOINTMENTS',
            'MANAGE_PROCEDURES',
            'VIEW_PATIENTS'
        ]::"ClinicPermission"[]
        ELSE ARRAY[
            'MANAGE_PROVIDER_PROFILE',
            'MANAGE_PROVIDER_SCHEDULE',
            'MANAGE_APPOINTMENTS',
            'MANAGE_PROCEDURES',
            'VIEW_PATIENTS'
        ]::"ClinicPermission"[]
    END,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "_ClinicEmployees"
INNER JOIN "users" ON "users"."id" = "_ClinicEmployees"."B"
ON CONFLICT ("clinic_id", "user_id") DO NOTHING;
