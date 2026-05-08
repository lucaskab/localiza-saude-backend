ALTER TABLE "appointments"
ADD COLUMN IF NOT EXISTS "service_modality" TEXT NOT NULL DEFAULT 'IN_PERSON';

UPDATE "users"
SET "service_modalities" = (
  SELECT COALESCE(
    ARRAY_AGG(DISTINCT
      CASE
        WHEN LOWER(TRIM(value)) IN ('presencial', 'consultorio', 'consultório', 'in_person', 'in person') THEN 'IN_PERSON'
        WHEN LOWER(TRIM(value)) IN ('online', 'telemedicina', 'teleatendimento') THEN 'ONLINE'
        WHEN LOWER(TRIM(value)) IN ('domiciliar', 'domicílio', 'a domicilio', 'a domicílio', 'home_care', 'home care') THEN 'HOME_CARE'
        ELSE value
      END
    ),
    ARRAY[]::TEXT[]
  )
  FROM UNNEST("users"."service_modalities") AS value
)
WHERE "role" = 'HEALTHCARE_PROVIDER';
