ALTER TABLE "users" DROP COLUMN IF EXISTS "address";
ALTER TABLE "users" DROP COLUMN IF EXISTS "clinic_address";
ALTER TABLE "users" DROP COLUMN IF EXISTS "clinic_latitude";
ALTER TABLE "users" DROP COLUMN IF EXISTS "clinic_longitude";
ALTER TABLE "users" DROP COLUMN IF EXISTS "clinic_neighborhood";
ALTER TABLE "users" DROP COLUMN IF EXISTS "clinic_city";
ALTER TABLE "users" DROP COLUMN IF EXISTS "clinic_state";

DROP INDEX IF EXISTS "users_clinic_city_idx";
DROP INDEX IF EXISTS "users_clinic_neighborhood_idx";
DROP INDEX IF EXISTS "users_clinic_latitude_clinic_longitude_idx";

ALTER TABLE "clinics" DROP COLUMN IF EXISTS "address";
ALTER TABLE "clinics" DROP COLUMN IF EXISTS "latitude";
ALTER TABLE "clinics" DROP COLUMN IF EXISTS "longitude";
