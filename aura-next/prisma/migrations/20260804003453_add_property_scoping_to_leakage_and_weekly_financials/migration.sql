/*
  Warnings:

  - Added the required column `propertyId` to the `LeakageCategory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `propertyId` to the `WeeklyFinancials` table without a default value. This is not possible if the table is not empty.
  - A unique constraint covering the columns `[propertyId,weekIndex]` on the table `WeeklyFinancials` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "WeeklyFinancials_weekIndex_key";

-- AlterTable
ALTER TABLE "LeakageCategory" ADD COLUMN     "propertyId" TEXT;

-- AlterTable
ALTER TABLE "WeeklyFinancials" ADD COLUMN     "propertyId" TEXT;

-- Backfill propertyId for existing rows before enforcing NOT NULL. The dev seed
-- script deletes and recreates every LeakageCategory/WeeklyFinancials row with
-- correct per-property values on next `prisma db seed` run, so this only needs to
-- satisfy the constraint, not be semantically accurate — same rationale as the
-- Alert/NightAuditRun backfill in 20260803182830_add_property_scoping_and_weekly_financials.
UPDATE "LeakageCategory" SET "propertyId" = (SELECT "id" FROM "Property" ORDER BY "createdAt" ASC LIMIT 1) WHERE "propertyId" IS NULL;
UPDATE "WeeklyFinancials" SET "propertyId" = (SELECT "id" FROM "Property" ORDER BY "createdAt" ASC LIMIT 1) WHERE "propertyId" IS NULL;

ALTER TABLE "LeakageCategory" ALTER COLUMN "propertyId" SET NOT NULL;
ALTER TABLE "WeeklyFinancials" ALTER COLUMN "propertyId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "LeakageCategory_propertyId_idx" ON "LeakageCategory"("propertyId");

-- CreateIndex
CREATE INDEX "WeeklyFinancials_propertyId_idx" ON "WeeklyFinancials"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyFinancials_propertyId_weekIndex_key" ON "WeeklyFinancials"("propertyId", "weekIndex");

-- AddForeignKey
ALTER TABLE "LeakageCategory" ADD CONSTRAINT "LeakageCategory_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyFinancials" ADD CONSTRAINT "WeeklyFinancials_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
