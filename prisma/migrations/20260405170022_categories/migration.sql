-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "healthcare_provider_categories" (
    "id" TEXT NOT NULL,
    "healthcare_provider_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "healthcare_provider_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE INDEX "healthcare_provider_categories_healthcare_provider_id_idx" ON "healthcare_provider_categories"("healthcare_provider_id");

-- CreateIndex
CREATE INDEX "healthcare_provider_categories_category_id_idx" ON "healthcare_provider_categories"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "healthcare_provider_categories_healthcare_provider_id_categ_key" ON "healthcare_provider_categories"("healthcare_provider_id", "category_id");

-- AddForeignKey
ALTER TABLE "healthcare_provider_categories" ADD CONSTRAINT "healthcare_provider_categories_healthcare_provider_id_fkey" FOREIGN KEY ("healthcare_provider_id") REFERENCES "healthcare_providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "healthcare_provider_categories" ADD CONSTRAINT "healthcare_provider_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
