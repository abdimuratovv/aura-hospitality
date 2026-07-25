/*
  Warnings:

  - Added the required column `shortName` to the `Property` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RiskBand" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "FraudSeverity" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('CRITICAL', 'WARNING', 'INFO');

-- CreateEnum
CREATE TYPE "ChecklistStatus" AS ENUM ('DONE', 'WARNING', 'CRITICAL', 'PENDING');

-- CreateEnum
CREATE TYPE "InsightType" AS ENUM ('CRITICAL', 'OPPORTUNITY', 'TREND');

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "shortName" TEXT;

-- Backfill shortName for existing rows before enforcing NOT NULL
UPDATE "Property" SET "shortName" = CASE "code"
  WHEN 'GM' THEN 'Grand Meridian'
  WHEN 'BS' THEN 'Bayside'
  WHEN 'OT' THEN 'Old Town'
  WHEN 'HB' THEN 'Harbor'
  WHEN 'SM' THEN 'Summit'
  WHEN 'RV' THEN 'Riverside'
  ELSE "name"
END;

ALTER TABLE "Property" ALTER COLUMN "shortName" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "criticalAlertsEmail" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "defaultPropertyId" TEXT,
ADD COLUMN     "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "weeklyDigest" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "lastActivityAt" TIMESTAMP(3) NOT NULL,
    "riskScore" INTEGER NOT NULL,
    "band" "RiskBand" NOT NULL,
    "propertyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FraudCase" (
    "id" TEXT NOT NULL,
    "severity" "FraudSeverity" NOT NULL,
    "pattern" TEXT NOT NULL,
    "agent" TEXT NOT NULL,
    "confidence" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "propertyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FraudCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeakageCategory" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "pct" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeakageCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "severity" "AlertSeverity" NOT NULL,
    "title" TEXT NOT NULL,
    "meta" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NightAuditRun" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "closeStepsCompleted" INTEGER NOT NULL,
    "closeStepsTotal" INTEGER NOT NULL,
    "openDiscrepancies" INTEGER NOT NULL,
    "discrepancyAmount" DECIMAL(10,2) NOT NULL,
    "revenuePosted" DECIMAL(10,2) NOT NULL,
    "transactionCount" INTEGER NOT NULL,
    "closeProgressPct" INTEGER NOT NULL,
    "estCompletionLabel" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NightAuditRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChecklistItem" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "detail" TEXT,
    "meta" TEXT NOT NULL,
    "status" "ChecklistStatus" NOT NULL,
    "order" INTEGER NOT NULL,
    "nightAuditRunId" TEXT NOT NULL,

    CONSTRAINT "ChecklistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportDefinition" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "lastUpdatedLabel" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "ReportDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Insight" (
    "id" TEXT NOT NULL,
    "type" "InsightType" NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Insight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyRiskScore" (
    "id" TEXT NOT NULL,
    "dayIndex" INTEGER NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "propertyId" TEXT NOT NULL,

    CONSTRAINT "PropertyRiskScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Employee_propertyId_idx" ON "Employee"("propertyId");

-- CreateIndex
CREATE INDEX "FraudCase_propertyId_idx" ON "FraudCase"("propertyId");

-- CreateIndex
CREATE INDEX "ChecklistItem_nightAuditRunId_idx" ON "ChecklistItem"("nightAuditRunId");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyRiskScore_propertyId_dayIndex_key" ON "PropertyRiskScore"("propertyId", "dayIndex");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_defaultPropertyId_fkey" FOREIGN KEY ("defaultPropertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FraudCase" ADD CONSTRAINT "FraudCase_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistItem" ADD CONSTRAINT "ChecklistItem_nightAuditRunId_fkey" FOREIGN KEY ("nightAuditRunId") REFERENCES "NightAuditRun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyRiskScore" ADD CONSTRAINT "PropertyRiskScore_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
