/*
  Warnings:

  - Added the required column `recovered` to the `LeakageCategory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LeakageCategory" ADD COLUMN     "recovered" DECIMAL(10,2);

-- Backfill before enforcing NOT NULL. The dev seed script deletes and recreates
-- every LeakageCategory row with real per-category recovered figures on next
-- `prisma db seed` run, so this only needs to satisfy the constraint — same
-- rationale as the Alert/NightAuditRun propertyId backfill in
-- 20260803182830_add_property_scoping_and_weekly_financials.
UPDATE "LeakageCategory" SET "recovered" = 0 WHERE "recovered" IS NULL;

ALTER TABLE "LeakageCategory" ALTER COLUMN "recovered" SET NOT NULL;
