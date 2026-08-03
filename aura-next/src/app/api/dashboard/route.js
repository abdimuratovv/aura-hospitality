import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db.js';
import { getSession } from '@/lib/session.js';
import { getAccessiblePropertyIds, resolvePropertyIds } from '@/lib/access.js';

export async function GET(request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const accessibleIds = await getAccessiblePropertyIds(session.id);
  const propertyIds = resolvePropertyIds(accessibleIds, searchParams.get('propertyId'));

  const [snapshot, insights, recentAlerts, riskScores, weeklyFinancials, openFraudCases, leakageCategories, nightAuditRuns] = await Promise.all([
    prisma.dashboardSnapshot.findFirst({ orderBy: { updatedAt: 'desc' } }),
    prisma.insight.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.alert.findMany({ where: { propertyId: { in: propertyIds } }, orderBy: { createdAt: 'desc' }, take: 4 }),
    prisma.propertyRiskScore.findMany({
      where: { propertyId: { in: propertyIds } },
      include: { property: true },
      orderBy: [{ property: { createdAt: 'asc' } }, { dayIndex: 'asc' }],
    }),
    prisma.weeklyFinancials.findMany({ orderBy: { weekIndex: 'asc' } }),
    // "Active" mirrors the Fraud Detection screen's Open Cases card: OPEN + INVESTIGATING only.
    prisma.fraudCase.findMany({
      where: { propertyId: { in: propertyIds }, status: { in: ['OPEN', 'INVESTIGATING'] } },
      select: { severity: true },
    }),
    // Portfolio-wide regardless of propertyIds — LeakageCategory has no propertyId yet.
    prisma.leakageCategory.findMany({ select: { amount: true, recovered: true } }),
    prisma.nightAuditRun.findMany({
      where: { propertyId: { in: propertyIds } },
      select: { closeProgressPct: true, openDiscrepancies: true },
    }),
  ]);

  const heatmap = {};
  for (const r of riskScores) {
    const key = r.property.name;
    if (!heatmap[key]) heatmap[key] = [];
    heatmap[key][r.dayIndex] = r.score;
  }

  const activeFraudAlerts = openFraudCases.length;
  const activeFraudAlertsCritical = openFraudCases.filter((c) => c.severity === 'CRITICAL').length;

  const revenueLeakage = leakageCategories.reduce((sum, c) => sum + Number(c.amount), 0);
  const revenueLeakageRecovered = leakageCategories.reduce((sum, c) => sum + Number(c.recovered), 0);

  const nightAuditPct = nightAuditRuns.length
    ? Math.round((nightAuditRuns.reduce((sum, r) => sum + r.closeProgressPct, 0) / nightAuditRuns.length) * 10) / 10
    : 0;
  const nightAuditExceptions = nightAuditRuns.reduce((sum, r) => sum + r.openDiscrepancies, 0);

  return NextResponse.json({
    snapshot: snapshot
      ? {
          portfolioRevenue: Number(snapshot.portfolioRevenue),
          portfolioRevenueChangePct: snapshot.portfolioRevenueChangePct,
          activeFraudAlerts,
          activeFraudAlertsCritical,
          revenueLeakage,
          revenueLeakageRecovered,
          nightAuditPct,
          nightAuditExceptions,
        }
      : null,
    insights: insights.map((i) => ({ id: i.id, type: i.type, text: i.text })),
    recentAlerts: recentAlerts.map((a) => ({ id: a.id, severity: a.severity, title: a.title, meta: a.meta, createdAt: a.createdAt })),
    heatmap,
    weeklyFinancials: weeklyFinancials.map((w) => ({
      weekIndex: w.weekIndex,
      weekLabel: w.weekLabel,
      revenue: Number(w.revenue),
      leakageRecovered: Number(w.leakageRecovered),
    })),
  });
}
