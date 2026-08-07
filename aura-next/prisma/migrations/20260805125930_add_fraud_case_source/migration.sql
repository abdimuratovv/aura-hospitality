-- CreateEnum
CREATE TYPE "FraudCaseSource" AS ENUM ('SEEDED', 'DETECTED');

-- AlterTable
ALTER TABLE "FraudCase" ADD COLUMN     "source" "FraudCaseSource" NOT NULL DEFAULT 'SEEDED';
