-- CreateEnum
CREATE TYPE "FraudCaseStatus" AS ENUM ('OPEN', 'INVESTIGATING', 'RESOLVED', 'FALSE_POSITIVE');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('OPEN', 'ACKNOWLEDGED', 'RESOLVED');

-- AlterTable
ALTER TABLE "Alert" ADD COLUMN     "status" "AlertStatus" NOT NULL DEFAULT 'OPEN';

-- AlterTable
ALTER TABLE "FraudCase" ADD COLUMN     "status" "FraudCaseStatus" NOT NULL DEFAULT 'OPEN';

-- CreateTable
CREATE TABLE "UserProperty" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserProperty_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserProperty_userId_idx" ON "UserProperty"("userId");

-- CreateIndex
CREATE INDEX "UserProperty_propertyId_idx" ON "UserProperty"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProperty_userId_propertyId_key" ON "UserProperty"("userId", "propertyId");

-- AddForeignKey
ALTER TABLE "UserProperty" ADD CONSTRAINT "UserProperty_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProperty" ADD CONSTRAINT "UserProperty_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
