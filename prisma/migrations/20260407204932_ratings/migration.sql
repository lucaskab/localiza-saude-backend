-- CreateTable
CREATE TABLE "ratings" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "healthcare_provider_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ratings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ratings_customer_id_idx" ON "ratings"("customer_id");

-- CreateIndex
CREATE INDEX "ratings_healthcare_provider_id_idx" ON "ratings"("healthcare_provider_id");

-- CreateIndex
CREATE UNIQUE INDEX "ratings_customer_id_healthcare_provider_id_key" ON "ratings"("customer_id", "healthcare_provider_id");

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_healthcare_provider_id_fkey" FOREIGN KEY ("healthcare_provider_id") REFERENCES "healthcare_providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
