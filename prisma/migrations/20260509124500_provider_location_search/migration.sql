ALTER TABLE "users"
ADD COLUMN "clinic_latitude" DOUBLE PRECISION,
ADD COLUMN "clinic_longitude" DOUBLE PRECISION,
ADD COLUMN "clinic_neighborhood" TEXT,
ADD COLUMN "clinic_city" TEXT,
ADD COLUMN "clinic_state" TEXT;

CREATE INDEX "users_clinic_city_idx" ON "users"("clinic_city");
CREATE INDEX "users_clinic_neighborhood_idx" ON "users"("clinic_neighborhood");
CREATE INDEX "users_clinic_latitude_clinic_longitude_idx" ON "users"("clinic_latitude", "clinic_longitude");
