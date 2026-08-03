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

  const [snapshot, insights, recentAlerts, riskScores, weeklyFinancials] = await Promise.all([
    prisma.dashboardSnapshot.findFirst({ orderBy: { updatedAt: 'desc' } }),
    prisma.insight.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.alert.findMany({ where: { propertyId: { in: propertyIds } }, orderBy: { createdAt: 'desc' }, take: 4 }),
    prisma.propertyRiskScore.findMany({
      where: { propertyId: { in: propertyIds } },
      include: { property: true },
      orderBy: [{ property: { createdAt: 'asc' } }, { dayIndex: 'asc' }],
    }),
    prisma.weeklyFinancials.findMany({ orderBy: { weekIndex: 'asc' } }),
  ]);

  const heatmap = {};
  for (const r of riskScores) {
    const key = r.property.name;
    if (!heatmap[key]) heatmap[key] = [];
    heatmap[key][r.dayIndex] = r.score;
  }

  return NextResponse.json({
    snapshot: snapshot
      ? {
          portfolioRevenue: Number(snapshot.portfolioRevenue),
          portfolioRevenueChangePct: snapshot.portfolioRevenueChangePct,
          activeFraudAlerts: snapshot.activeFraudAlerts,
          activeFraudAlertsCritical: snapshot.activeFraudAlertsCritical,
          revenueLeakage: Number(snapshot.revenueLeakage),
          revenueLeakageRecovered: Number(snapshot.revenueLeakageRecovered),
          nightAuditPct: snapshot.nightAuditPct,
          nightAuditExceptions: snapshot.nightAuditExceptions,
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
