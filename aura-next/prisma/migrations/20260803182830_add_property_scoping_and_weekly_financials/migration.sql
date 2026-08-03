/*
  Warnings:

  - Added the required column `propertyId` to the `Alert` table without a default value. This is not possible if the table is not empty.
  - Added the required column `propertyId` to the `NightAuditRun` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Alert" ADD COLUMN     "propertyId" TEXT;

-- AlterTable
ALTER TABLE "NightAuditRun" ADD COLUMN     "propertyId" TEXT;

-- Backfill propertyId for existing rows before enforcing NOT NULL. The dev seed
-- script deletes and recreates every Alert/NightAuditRun row with correct
-- per-property values on next `prisma db seed` run, so this only needs to satisfy
-- the constraint, not be semantically accurate — same rationale as the
-- Property.shortName backfill in 20260725074452_add_screen_models.
UPDATE "Alert" SET "propertyId" = (SELECT "id" FROM "Property" ORDER BY "createdAt" ASC LIMIT 1) WHERE "propertyId" IS NULL;
UPDATE "NightAuditRun" SET "propertyId" = (SELECT "id" FROM "Property" ORDER BY "createdAt" ASC LIMIT 1) WHERE "propertyId" IS NULL;

ALTER TABLE "Alert" ALTER COLUMN "propertyId" SET NOT NULL;
ALTER TABLE "NightAuditRun" ALTER COLUMN "propertyId" SET NOT NULL;

-- CreateTable
CREATE TABLE "WeeklyFinancials" (
    "id" TEXT NOT NULL,
    "weekIndex" INTEGER NOT NULL,
    "weekLabel" TEXT NOT NULL,
    "revenue" DECIMAL(12,2) NOT NULL,
    "leakageRecovered" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeeklyFinancials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyFinancials_weekIndex_key" ON "WeeklyFinancials"("weekIndex");

-- CreateIndex
CREATE INDEX "Alert_propertyId_idx" ON "Alert"("propertyId");

-- CreateIndex
CREATE INDEX "NightAuditRun_propertyId_idx" ON "NightAuditRun"("propertyId");

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NightAuditRun" ADD CONSTRAINT "NightAuditRun_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
