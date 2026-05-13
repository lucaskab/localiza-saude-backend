-- CreateTable
CREATE TABLE "professional_councils" (
    "id" TEXT NOT NULL,
    "acronym" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "profession" TEXT NOT NULL,
    "allows_price_display" BOOLEAN NOT NULL DEFAULT true,
    "price_display_note" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "professional_councils_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "professional_councils_acronym_key" ON "professional_councils"("acronym");

-- CreateIndex
CREATE INDEX "professional_councils_active_idx" ON "professional_councils"("active");

-- AlterTable
ALTER TABLE "users" ADD COLUMN "professional_council_id" TEXT;

-- Seed professional councils used by Brazilian healthcare professionals.
INSERT INTO "professional_councils" (
    "id",
    "acronym",
    "name",
    "profession",
    "allows_price_display",
    "price_display_note",
    "updated_at"
) VALUES
    ('professional-council-crm', 'CRM', 'Conselho Regional de Medicina', 'Medicina', true, 'CFM permite informar valores de consultas e formas de pagamento, respeitadas as regras de publicidade médica.', CURRENT_TIMESTAMP),
    ('professional-council-cro', 'CRO', 'Conselho Regional de Odontologia', 'Odontologia', false, 'Regra conservadora para evitar publicidade de preço em serviços odontológicos.', CURRENT_TIMESTAMP),
    ('professional-council-crp', 'CRP', 'Conselho Regional de Psicologia', 'Psicologia', false, 'Evita uso de preço como forma de propaganda em serviços psicológicos.', CURRENT_TIMESTAMP),
    ('professional-council-crn', 'CRN', 'Conselho Regional de Nutricionistas', 'Nutrição', false, 'Regra conservadora: evita uso de honorários, promoções ou preços como publicidade.', CURRENT_TIMESTAMP),
    ('professional-council-crefito', 'CREFITO', 'Conselho Regional de Fisioterapia e Terapia Ocupacional', 'Fisioterapia e Terapia Ocupacional', false, 'COFFITO orienta não divulgar tabelas de preços fora do consultório ou clínica.', CURRENT_TIMESTAMP),
    ('professional-council-coren', 'COREN', 'Conselho Regional de Enfermagem', 'Enfermagem', false, 'Regra conservadora para divulgação pública de preços em serviços de enfermagem.', CURRENT_TIMESTAMP),
    ('professional-council-crf', 'CRF', 'Conselho Regional de Farmácia', 'Farmácia', false, 'Regra conservadora para divulgação pública de preços em serviços farmacêuticos.', CURRENT_TIMESTAMP),
    ('professional-council-crbm', 'CRBM', 'Conselho Regional de Biomedicina', 'Biomedicina', false, 'Regra conservadora para divulgação pública de preços em serviços biomédicos.', CURRENT_TIMESTAMP),
    ('professional-council-crefono', 'CREFONO', 'Conselho Regional de Fonoaudiologia', 'Fonoaudiologia', false, 'Código de Ética da Fonoaudiologia considera infração anunciar preços e descontos.', CURRENT_TIMESTAMP),
    ('professional-council-cref', 'CREF', 'Conselho Regional de Educação Física', 'Educação Física', true, 'Permite exibição de preço no marketplace por padrão, sem campanhas enganosas ou abusivas.', CURRENT_TIMESTAMP),
    ('professional-council-crbio', 'CRBio', 'Conselho Regional de Biologia', 'Biologia', true, 'Permite exibição de preço no marketplace por padrão, respeitando regras profissionais aplicáveis.', CURRENT_TIMESTAMP),
    ('professional-council-crmv', 'CRMV', 'Conselho Regional de Medicina Veterinária', 'Medicina Veterinária', true, 'Permite exibição de preço no marketplace por padrão, respeitando regras profissionais aplicáveis.', CURRENT_TIMESTAMP),
    ('professional-council-cress', 'CRESS', 'Conselho Regional de Serviço Social', 'Serviço Social', false, 'Regra conservadora para divulgação pública de preços em serviços sociais ligados à saúde.', CURRENT_TIMESTAMP),
    ('professional-council-crq', 'CRQ', 'Conselho Regional de Química', 'Química aplicada à saúde', false, 'Regra conservadora para atividades de saúde vinculadas a registro em conselho de química.', CURRENT_TIMESTAMP),
    ('professional-council-crtr', 'CRTR', 'Conselho Regional de Técnicos em Radiologia', 'Radiologia', false, 'Regra conservadora para divulgação pública de preços em serviços de radiologia.', CURRENT_TIMESTAMP),
    ('professional-council-rms', 'RMS', 'Registro do Ministério da Saúde (Programa Mais Médicos)', 'Medicina', false, 'Registro especial do Programa Mais Médicos; por padrão, o marketplace não exibe preços públicos.', CURRENT_TIMESTAMP)
ON CONFLICT ("acronym") DO NOTHING;

-- Best-effort migration from the previous free-text field.
UPDATE "users"
SET "professional_council_id" = "professional_councils"."id"
FROM "professional_councils"
WHERE UPPER(TRIM("users"."license_council")) = UPPER("professional_councils"."acronym");

-- Drop legacy free-text column now that the project is still in development.
ALTER TABLE "users" DROP COLUMN "license_council";

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_professional_council_id_fkey" FOREIGN KEY ("professional_council_id") REFERENCES "professional_councils"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "users_professional_council_id_idx" ON "users"("professional_council_id");
