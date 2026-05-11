CREATE TABLE "procedure_checklist_items" (
  "id" TEXT NOT NULL,
  "procedure_id" TEXT NOT NULL,
  "text" TEXT NOT NULL,
  "position" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "procedure_checklist_items_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "procedure_checklist_items_procedure_id_idx" ON "procedure_checklist_items"("procedure_id");

ALTER TABLE "procedure_checklist_items"
ADD CONSTRAINT "procedure_checklist_items_procedure_id_fkey"
FOREIGN KEY ("procedure_id") REFERENCES "procedures"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
