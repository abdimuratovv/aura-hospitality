import { config as loadEnv } from 'dotenv';
loadEnv({ path: '.env.local' });

import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const properties = [
  { code: 'GM', name: 'The Grand Meridian', shortName: 'Grand Meridian' },
  { code: 'BS', name: 'Meridian Bayside', shortName: 'Bayside' },
  { code: 'OT', name: 'Meridian Old Town', shortName: 'Old Town' },
  { code: 'HB', name: 'Meridian Harbor', shortName: 'Harbor' },
  { code: 'SM', name: 'Meridian Summit', shortName: 'Summit' },
  { code: 'RV', name: 'Meridian Riverside', shortName: 'Riverside' },
];

const agents = ['M. Alvarez', 'J. Okafor', 'D. Fischer', 'L. Petrov', 'S. Nakamura', 'R. Chandra', 'System'];

const txnTemplates = [
  { type: 'Refund', amountRange: [-3000, -500], flag: 'FLAGGED' },
  { type: 'Room posting', amountRange: [400, 4200], flag: 'CLEARED' },
  { type: 'Rate override', amountRange: [1500, 6000], flag: 'REVIEW' },
  { type: 'Minibar', amountRange: [20, 220], flag: 'CLEARED' },
  { type: 'Cash close', amountRange: [-900, -200], flag: 'FLAGGED' },
  { type: 'City ledger', amountRange: [800, 5200], flag: 'CLEARED' },
  { type: 'Discount', amountRange: [-2200, -300], flag: 'REVIEW' },
  { type: 'Deposit', amountRange: [500, 3200], flag: 'CLEARED' },
];

function pick(arr, i) {
  return arr[i % arr.length];
}

function amountFor(template, seed) {
  const [lo, hi] = template.amountRange;
  const span = hi - lo;
  // deterministic pseudo-spread so re-seeding produces the same data
  const frac = ((seed * 2654435761) % 1000) / 1000;
  return Math.round((lo + span * frac) * 100) / 100;
}

function hoursAgo(h) {
  return new Date(Date.now() - h * 60 * 60 * 1000);
}
function minutesAgo(m) {
  return new Date(Date.now() - m * 60 * 1000);
}
function todayAt(h, m) {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

async function main() {
  const passwordHash = await bcrypt.hash('aura-secure-2026', 10);

  const propertyRecords = [];
  for (const p of properties) {
    const rec = await prisma.property.upsert({
      where: { code: p.code },
      update: { name: p.name, shortName: p.shortName },
      create: p,
    });
    propertyRecords.push(rec);
  }
  const byCode = Object.fromEntries(propertyRecords.map((p) => [p.code, p]));

  const cfo = await prisma.user.upsert({
    where: { email: 'e.reyes@meridianhotels.com' },
    update: { defaultPropertyId: byCode.GM.id },
    create: {
      email: 'e.reyes@meridianhotels.com',
      passwordHash,
      name: 'Elena Reyes',
      role: 'Chief Financial Officer',
      defaultPropertyId: byCode.GM.id,
      twoFactorEnabled: true,
      criticalAlertsEmail: true,
      weeklyDigest: false,
    },
  });

  // Property-level GM, scoped to a single property — demonstrates that
  // property access is actually restrictive, not just plumbing.
  const gm = await prisma.user.upsert({
    where: { email: 'r.chandra@meridianhotels.com' },
    update: { defaultPropertyId: byCode.BS.id },
    create: {
      email: 'r.chandra@meridianhotels.com',
      passwordHash,
      name: 'Ravi Chandra',
      role: 'General Manager',
      defaultPropertyId: byCode.BS.id,
      twoFactorEnabled: true,
      criticalAlertsEmail: true,
      weeklyDigest: true,
    },
  });

  // ---- Property access grants ----
  await prisma.userProperty.deleteMany({});
  await prisma.userProperty.createMany({
    data: [
      // CFO: portfolio-wide, sees every property.
      ...propertyRecords.map((p) => ({ userId: cfo.id, propertyId: p.id })),
      // Property GM: scoped to Bayside only.
      { userId: gm.id, propertyId: byCode.BS.id },
    ],
  });

  // ---- Transactions ----
  await prisma.transaction.deleteMany({});
  const now = new Date();
  const txnRows = [];
  const TXN_COUNT = 32;
  for (let i = 0; i < TXN_COUNT; i++) {
    const template = pick(txnTemplates, i);
    const property = pick(propertyRecords, i * 3 + 1);
    const agent = ['Room posting', 'City ledger', 'Minibar', 'Deposit'].includes(template.type) ? 'System' : pick(agents, i * 5 + 2);
    const postedAt = new Date(now.getTime() - i * 47 * 60 * 1000);
    const amount = amountFor(template, i + 1);

    txnRows.push({
      folioId: `${property.code}-${88000 + i * 13}`,
      postedAt,
      type: template.type,
      agent,
      amount,
      flag: template.flag,
      propertyId: property.id,
    });
  }
  await prisma.transaction.createMany({ data: txnRows });

  // ---- Employees ----
  await prisma.employee.deleteMany({});
  await prisma.employee.createMany({
    data: [
      { name: 'James Okafor', role: 'Front Desk Agent', propertyId: byCode.GM.id, lastActivityAt: todayAt(3, 14), riskScore: 87, band: 'HIGH' },
      { name: 'Sana Nakamura', role: 'Front Desk Agent', propertyId: byCode.OT.id, lastActivityAt: todayAt(2, 47), riskScore: 74, band: 'HIGH' },
      { name: 'Lev Petrov', role: 'Night Manager', propertyId: byCode.RV.id, lastActivityAt: hoursAgo(20), riskScore: 61, band: 'MEDIUM' },
      { name: 'Maria Alvarez', role: 'Front Desk Agent', propertyId: byCode.GM.id, lastActivityAt: todayAt(1, 20), riskScore: 52, band: 'MEDIUM' },
      { name: 'Dana Fischer', role: 'Cashier', propertyId: byCode.SM.id, lastActivityAt: todayAt(0, 58), riskScore: 34, band: 'LOW' },
      { name: 'Ravi Chandra', role: 'Guest Services', propertyId: byCode.BS.id, lastActivityAt: hoursAgo(22), riskScore: 21, band: 'LOW' },
    ],
  });

  // ---- Fraud cases ----
  await prisma.fraudCase.deleteMany({});
  await prisma.fraudCase.createMany({
    data: [
      { severity: 'CRITICAL', pattern: 'Void → repost, same folio', agent: 'J. Okafor', propertyId: byCode.GM.id, confidence: 97, amount: 8420 },
      { severity: 'CRITICAL', pattern: 'Duplicate refund issued', agent: 'M. Alvarez', propertyId: byCode.GM.id, confidence: 95, amount: 2480 },
      { severity: 'HIGH', pattern: 'After-hours rate override', agent: 'J. Okafor', propertyId: byCode.BS.id, confidence: 88, amount: 5110 },
      { severity: 'HIGH', pattern: 'Comp room, no approval', agent: 'S. Nakamura', propertyId: byCode.OT.id, confidence: 84, amount: 3900 },
      { severity: 'MEDIUM', pattern: 'Cash variance at close', agent: 'D. Fischer', propertyId: byCode.SM.id, confidence: 72, amount: 610 },
      { severity: 'MEDIUM', pattern: 'Discount above threshold', agent: 'L. Petrov', propertyId: byCode.RV.id, confidence: 68, amount: 1240 },
    ],
  });

  // ---- Leakage categories ----
  await prisma.leakageCategory.deleteMany({});
  await prisma.leakageCategory.createMany({
    data: [
      { category: 'Unbilled minibar & F&B', amount: 70120, recovered: 32000, pct: 38, order: 1 },
      { category: 'Late-checkout fees missed', amount: 44300, recovered: 21000, pct: 24, order: 2 },
      { category: 'Rate parity / underpricing', amount: 33180, recovered: 9500, pct: 18, order: 3 },
      { category: 'Uncaptured resort fees', amount: 22090, recovered: 6200, pct: 12, order: 4 },
      { category: 'No-show not charged', amount: 14720, recovered: 2640, pct: 8, order: 5 },
    ],
  });

  // ---- Alerts ----
  await prisma.alert.deleteMany({});
  await prisma.alert.createMany({
    data: [
      { severity: 'CRITICAL', title: 'Duplicate refund — $2,480', meta: 'Folio #GM-88213 · The Grand Meridian · Fraud', source: 'Fraud', propertyId: byCode.GM.id, createdAt: minutesAgo(2) },
      { severity: 'CRITICAL', title: 'Void-then-repost pattern detected', meta: 'Agent J. Okafor · The Grand Meridian · Fraud', source: 'Fraud', propertyId: byCode.GM.id, createdAt: minutesAgo(9) },
      { severity: 'WARNING', title: 'Cash variance at close — $610', meta: 'Front Desk · Meridian Bayside · Audit', source: 'Audit', propertyId: byCode.BS.id, createdAt: minutesAgo(18) },
      { severity: 'CRITICAL', title: 'After-hours rate override', meta: 'Agent J. Okafor · 03:14 local · Fraud', source: 'Fraud', propertyId: byCode.BS.id, createdAt: minutesAgo(41) },
      { severity: 'INFO', title: 'Unbilled minibar batch flagged', meta: '42 folios · Meridian Old Town · Leakage', source: 'Leakage', propertyId: byCode.OT.id, createdAt: hoursAgo(1) },
      { severity: 'WARNING', title: 'Comp room approval missing', meta: 'Agent S. Nakamura · Meridian Old Town · Fraud', source: 'Fraud', propertyId: byCode.OT.id, createdAt: hoursAgo(2) },
      { severity: 'INFO', title: 'Late-checkout fees uncaptured', meta: '18 folios · Meridian Summit · Leakage', source: 'Leakage', propertyId: byCode.SM.id, createdAt: hoursAgo(3) },
    ],
  });

  // ---- Night audit runs + checklists (one run per property) ----
  await prisma.checklistItem.deleteMany({});
  await prisma.nightAuditRun.deleteMany({});
  const checklistLabels = [
    'Room & tax revenue posted',
    'City ledger reconciled',
    'Comp & house accounts verified',
    'Deposits ledger',
    'Cash drawer close',
    'Generate manager report',
  ];
  const nightAuditByProperty = {
    GM: {
      run: { closeStepsCompleted: 6, closeStepsTotal: 9, openDiscrepancies: 3, discrepancyAmount: 1240, revenuePosted: 612480, transactionCount: 1284, closeProgressPct: 66, estCompletionLabel: '04:20 local' },
      checklist: [
        { meta: '03:41', status: 'DONE' },
        { meta: '03:47', status: 'DONE' },
        { meta: '03:52', status: 'DONE' },
        { detail: '$630 unmatched', meta: 'Review', status: 'WARNING' },
        { detail: '$610 short', meta: 'Investigate', status: 'CRITICAL' },
        { meta: 'Pending', status: 'PENDING' },
      ],
    },
    BS: {
      run: { closeStepsCompleted: 9, closeStepsTotal: 9, openDiscrepancies: 0, discrepancyAmount: 0, revenuePosted: 398200, transactionCount: 812, closeProgressPct: 100, estCompletionLabel: 'Complete' },
      checklist: [
        { meta: '02:58', status: 'DONE' },
        { meta: '03:04', status: 'DONE' },
        { meta: '03:09', status: 'DONE' },
        { meta: '03:15', status: 'DONE' },
        { meta: '03:22', status: 'DONE' },
        { meta: '03:30', status: 'DONE' },
      ],
    },
    OT: {
      run: { closeStepsCompleted: 7, closeStepsTotal: 9, openDiscrepancies: 1, discrepancyAmount: 340, revenuePosted: 275600, transactionCount: 601, closeProgressPct: 78, estCompletionLabel: '03:55 local' },
      checklist: [
        { meta: '03:10', status: 'DONE' },
        { meta: '03:18', status: 'DONE' },
        { meta: '03:25', status: 'DONE' },
        { detail: '$340 unmatched', meta: 'Review', status: 'WARNING' },
        { meta: '03:40', status: 'DONE' },
        { meta: 'Pending', status: 'PENDING' },
      ],
    },
    HB: {
      run: { closeStepsCompleted: 9, closeStepsTotal: 9, openDiscrepancies: 0, discrepancyAmount: 0, revenuePosted: 189400, transactionCount: 402, closeProgressPct: 100, estCompletionLabel: 'Complete' },
      checklist: [
        { meta: '02:40', status: 'DONE' },
        { meta: '02:48', status: 'DONE' },
        { meta: '02:55', status: 'DONE' },
        { meta: '03:02', status: 'DONE' },
        { meta: '03:10', status: 'DONE' },
        { meta: '03:18', status: 'DONE' },
      ],
    },
    SM: {
      run: { closeStepsCompleted: 5, closeStepsTotal: 9, openDiscrepancies: 2, discrepancyAmount: 610, revenuePosted: 224800, transactionCount: 470, closeProgressPct: 56, estCompletionLabel: '04:45 local' },
      checklist: [
        { meta: '03:20', status: 'DONE' },
        { meta: '03:28', status: 'DONE' },
        { detail: '$210 unmatched', meta: 'Review', status: 'WARNING' },
        { meta: 'Pending', status: 'PENDING' },
        { detail: '$400 short', meta: 'Investigate', status: 'CRITICAL' },
        { meta: 'Pending', status: 'PENDING' },
      ],
    },
    RV: {
      run: { closeStepsCompleted: 8, closeStepsTotal: 9, openDiscrepancies: 1, discrepancyAmount: 180, revenuePosted: 205100, transactionCount: 388, closeProgressPct: 89, estCompletionLabel: '03:30 local' },
      checklist: [
        { meta: '03:05', status: 'DONE' },
        { meta: '03:12', status: 'DONE' },
        { meta: '03:18', status: 'DONE' },
        { meta: '03:24', status: 'DONE' },
        { detail: '$180 unmatched', meta: 'Review', status: 'WARNING' },
        { meta: '03:35', status: 'DONE' },
      ],
    },
  };
  for (const code of Object.keys(nightAuditByProperty)) {
    const { run: runData, checklist } = nightAuditByProperty[code];
    const propRun = await prisma.nightAuditRun.create({
      data: { date: new Date(), propertyId: byCode[code].id, ...runData },
    });
    await prisma.checklistItem.createMany({
      data: checklist.map((item, i) => ({
        nightAuditRunId: propRun.id,
        label: checklistLabels[i],
        detail: item.detail ?? null,
        meta: item.meta,
        status: item.status,
        order: i + 1,
      })),
    });
  }

  // ---- Report definitions ----
  await prisma.reportDefinition.deleteMany({});
  await prisma.reportDefinition.createMany({
    data: [
      { title: 'Executive Board Pack', description: 'Portfolio P&L, risk & recovery summary', frequency: 'Monthly', lastUpdatedLabel: 'Jul 1', order: 1 },
      { title: 'Fraud Investigation Log', description: 'All cases, dispositions and outcomes', frequency: 'Weekly', lastUpdatedLabel: 'Jul 20', order: 2 },
      { title: 'Revenue Leakage Recovery', description: 'Identified vs. recovered by category', frequency: 'Weekly', lastUpdatedLabel: 'Jul 21', order: 3 },
      { title: 'Night Audit Close Report', description: 'Per-property reconciliation & exceptions', frequency: 'Daily', lastUpdatedLabel: 'Today', order: 4 },
      { title: 'Employee Risk Register', description: 'Behavioral risk scoring across staff', frequency: 'Monthly', lastUpdatedLabel: 'Jul 1', order: 5 },
      { title: 'Compliance & Controls', description: 'SOX-aligned control attestation', frequency: 'Quarterly', lastUpdatedLabel: 'Jun 30', order: 6 },
    ],
  });

  // ---- Insights ----
  await prisma.insight.deleteMany({});
  await prisma.insight.createMany({
    data: [
      { type: 'CRITICAL', text: 'Voided-then-reposted folios at The Grand Meridian spiked 340% overnight — concentrated on 2 front-desk agents.' },
      { type: 'OPPORTUNITY', text: 'Unbilled minibar & late-checkout fees across 3 properties total $71K recoverable this cycle.' },
      { type: 'TREND', text: 'Comp-room approvals are trending down 12% — policy tightening is holding.' },
    ],
  });

  // ---- Property risk scores (heatmap) ----
  await prisma.propertyRiskScore.deleteMany({});
  const heat = {
    GM: [0.2, 0.3, 0.85, 0.9, 0.4, 0.25, 0.7],
    BS: [0.15, 0.2, 0.3, 0.5, 0.35, 0.2, 0.25],
    OT: [0.3, 0.55, 0.4, 0.35, 0.6, 0.45, 0.3],
    HB: [0.1, 0.15, 0.2, 0.25, 0.2, 0.15, 0.3],
    SM: [0.4, 0.35, 0.5, 0.7, 0.55, 0.4, 0.45],
    RV: [0.2, 0.25, 0.3, 0.2, 0.4, 0.3, 0.2],
  };
  const riskRows = [];
  for (const code of Object.keys(heat)) {
    heat[code].forEach((score, dayIndex) => {
      riskRows.push({ propertyId: byCode[code].id, dayIndex, score });
    });
  }
  await prisma.propertyRiskScore.createMany({ data: riskRows });

  // ---- Dashboard snapshot (Portfolio Revenue only — the other 3 stat cards are
  // computed live from FraudCase/LeakageCategory/NightAuditRun in /api/dashboard) ----
  await prisma.dashboardSnapshot.deleteMany({});
  await prisma.dashboardSnapshot.create({
    data: {
      portfolioRevenue: 4820000,
      portfolioRevenueChangePct: 6.4,
    },
  });

  // ---- Weekly financials (Dashboard's revenue vs. recovered-leakage chart) ----
  await prisma.weeklyFinancials.deleteMany({});
  const weeklyFinancials = [
    { weekIndex: 0, weekLabel: 'Wk 1', revenue: 4120000, leakageRecovered: 13800 },
    { weekIndex: 1, weekLabel: 'Wk 2', revenue: 4180000, leakageRecovered: 14200 },
    { weekIndex: 2, weekLabel: 'Wk 3', revenue: 4050000, leakageRecovered: 15100 },
    { weekIndex: 3, weekLabel: 'Wk 4', revenue: 4310000, leakageRecovered: 15800 },
    { weekIndex: 4, weekLabel: 'Wk 5', revenue: 4420000, leakageRecovered: 16400 },
    { weekIndex: 5, weekLabel: 'Wk 6', revenue: 4260000, leakageRecovered: 15200 },
    { weekIndex: 6, weekLabel: 'Wk 7', revenue: 4580000, leakageRecovered: 17100 },
    { weekIndex: 7, weekLabel: 'Wk 8', revenue: 4690000, leakageRecovered: 17800 },
    { weekIndex: 8, weekLabel: 'Wk 9', revenue: 4530000, leakageRecovered: 16900 },
    { weekIndex: 9, weekLabel: 'Wk 10', revenue: 4750000, leakageRecovered: 18400 },
    { weekIndex: 10, weekLabel: 'Wk 11', revenue: 4820000, leakageRecovered: 19100 },
    { weekIndex: 11, weekLabel: 'Wk 12', revenue: 4910000, leakageRecovered: 19800 },
  ];
  await prisma.weeklyFinancials.createMany({ data: weeklyFinancials });

  console.log(
    `Seeded: 2 users (${propertyRecords.length + 1} property-access grants), ${propertyRecords.length} properties, ${txnRows.length} transactions, 6 employees, 6 fraud cases, 5 leakage categories, 7 alerts, ${Object.keys(nightAuditByProperty).length} night audit runs (6 checklist items each), 6 report definitions, 3 insights, ${riskRows.length} risk scores, ${weeklyFinancials.length} weekly financials rows.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
