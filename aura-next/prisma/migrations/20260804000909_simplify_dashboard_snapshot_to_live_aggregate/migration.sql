/*
  Warnings:

  - You are about to drop the column `activeFraudAlerts` on the `DashboardSnapshot` table. All the data in the column will be lost.
  - You are about to drop the column `activeFraudAlertsCritical` on the `DashboardSnapshot` table. All the data in the column will be lost.
  - You are about to drop the column `nightAuditExceptions` on the `DashboardSnapshot` table. All the data in the column will be lost.
  - You are about to drop the column `nightAuditPct` on the `DashboardSnapshot` table. All the data in the column will be lost.
  - You are about to drop the column `revenueLeakage` on the `DashboardSnapshot` table. All the data in the column will be lost.
  - You are about to drop the column `revenueLeakageRecovered` on the `DashboardSnapshot` table. All the data in the column will be lost.

  These four stat cards are now computed live from FraudCase/LeakageCategory/NightAuditRun
  in /api/dashboard instead of being read from this seeded snapshot row — only
  Portfolio Revenue stays a seeded stand-in (see the schema.prisma comment on
  DashboardSnapshot for why).

*/
-- AlterTable
ALTER TABLE "DashboardSnapshot" DROP COLUMN "activeFraudAlerts",
DROP COLUMN "activeFraudAlertsCritical",
DROP COLUMN "nightAuditExceptions",
DROP COLUMN "nightAuditPct",
DROP COLUMN "revenueLeakage",
DROP COLUMN "revenueLeakageRecovered";
