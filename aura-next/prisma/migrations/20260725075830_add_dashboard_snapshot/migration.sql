-- CreateTable
CREATE TABLE "DashboardSnapshot" (
    "id" TEXT NOT NULL,
    "portfolioRevenue" DECIMAL(12,2) NOT NULL,
    "portfolioRevenueChangePct" DOUBLE PRECISION NOT NULL,
    "activeFraudAlerts" INTEGER NOT NULL,
    "activeFraudAlertsCritical" INTEGER NOT NULL,
    "revenueLeakage" DECIMAL(12,2) NOT NULL,
    "revenueLeakageRecovered" DECIMAL(12,2) NOT NULL,
    "nightAuditPct" DOUBLE PRECISION NOT NULL,
    "nightAuditExceptions" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DashboardSnapshot_pkey" PRIMARY KEY ("id")
);
