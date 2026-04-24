-- CreateTable
CREATE TABLE "customer_favorite_providers" (
    "customer_id" TEXT NOT NULL,
    "healthcare_provider_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_favorite_providers_pkey" PRIMARY KEY ("customer_id","healthcare_provider_id")
);

-- CreateIndex
CREATE INDEX "customer_favorite_providers_customer_id_idx" ON "customer_favorite_providers"("customer_id");

-- CreateIndex
CREATE INDEX "customer_favorite_providers_healthcare_provider_id_idx" ON "customer_favorite_providers"("healthcare_provider_id");

-- AddForeignKey
ALTER TABLE "customer_favorite_providers" ADD CONSTRAINT "customer_favorite_providers_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_favorite_providers" ADD CONSTRAINT "customer_favorite_providers_healthcare_provider_id_fkey" FOREIGN KEY ("healthcare_provider_id") REFERENCES "healthcare_providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
