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

  await prisma.user.upsert({
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
      { category: 'Unbilled minibar & F&B', amount: 70120, pct: 38, order: 1 },
      { category: 'Late-checkout fees missed', amount: 44300, pct: 24, order: 2 },
      { category: 'Rate parity / underpricing', amount: 33180, pct: 18, order: 3 },
      { category: 'Uncaptured resort fees', amount: 22090, pct: 12, order: 4 },
      { category: 'No-show not charged', amount: 14720, pct: 8, order: 5 },
    ],
  });

  // ---- Alerts ----
  await prisma.alert.deleteMany({});
  await prisma.alert.createMany({
    data: [
      { severity: 'CRITICAL', title: 'Duplicate refund — $2,480', meta: 'Folio #GM-88213 · The Grand Meridian · Fraud', source: 'Fraud', createdAt: minutesAgo(2) },
      { severity: 'CRITICAL', title: 'Void-then-repost pattern detected', meta: 'Agent J. Okafor · The Grand Meridian · Fraud', source: 'Fraud', createdAt: minutesAgo(9) },
      { severity: 'WARNING', title: 'Cash variance at close — $610', meta: 'Front Desk · Meridian Bayside · Audit', source: 'Audit', createdAt: minutesAgo(18) },
      { severity: 'CRITICAL', title: 'After-hours rate override', meta: 'Agent J. Okafor · 03:14 local · Fraud', source: 'Fraud', createdAt: minutesAgo(41) },
      { severity: 'INFO', title: 'Unbilled minibar batch flagged', meta: '42 folios · Meridian Old Town · Leakage', source: 'Leakage', createdAt: hoursAgo(1) },
      { severity: 'WARNING', title: 'Comp room approval missing', meta: 'Agent S. Nakamura · Meridian Old Town · Fraud', source: 'Fraud', createdAt: hoursAgo(2) },
      { severity: 'INFO', title: 'Late-checkout fees uncaptured', meta: '18 folios · Meridian Summit · Leakage', source: 'Leakage', createdAt: hoursAgo(3) },
    ],
  });

  // ---- Night audit run + checklist ----
  await prisma.checklistItem.deleteMany({});
  await prisma.nightAuditRun.deleteMany({});
  const run = await prisma.nightAuditRun.create({
    data: {
      date: new Date(),
      closeStepsCompleted: 6,
      closeStepsTotal: 9,
      openDiscrepancies: 3,
      discrepancyAmount: 1240,
      revenuePosted: 612480,
      transactionCount: 1284,
      closeProgressPct: 66,
      estCompletionLabel: '04:20 local',
    },
  });
  await prisma.checklistItem.createMany({
    data: [
      { nightAuditRunId: run.id, label: 'Room & tax revenue posted', detail: null, meta: '03:41', status: 'DONE', order: 1 },
      { nightAuditRunId: run.id, label: 'City ledger reconciled', detail: null, meta: '03:47', status: 'DONE', order: 2 },
      { nightAuditRunId: run.id, label: 'Comp & house accounts verified', detail: null, meta: '03:52', status: 'DONE', order: 3 },
      { nightAuditRunId: run.id, label: 'Deposits ledger', detail: '$630 unmatched', meta: 'Review', status: 'WARNING', order: 4 },
      { nightAuditRunId: run.id, label: 'Cash drawer close', detail: '$610 short', meta: 'Investigate', status: 'CRITICAL', order: 5 },
      { nightAuditRunId: run.id, label: 'Generate manager report', detail: null, meta: 'Pending', status: 'PENDING', order: 6 },
    ],
  });

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

  // ---- Dashboard snapshot ----
  await prisma.dashboardSnapshot.deleteMany({});
  await prisma.dashboardSnapshot.create({
    data: {
      portfolioRevenue: 4820000,
      portfolioRevenueChangePct: 6.4,
      activeFraudAlerts: 12,
      activeFraudAlertsCritical: 3,
      revenueLeakage: 184000,
      revenueLeakageRecovered: 71000,
      nightAuditPct: 98.2,
      nightAuditExceptions: 3,
    },
  });

  console.log(
    `Seeded: 1 user, ${propertyRecords.length} properties, ${txnRows.length} transactions, 6 employees, 6 fraud cases, 5 leakage categories, 7 alerts, 1 night audit run (6 checklist items), 6 report definitions, 3 insights, ${riskRows.length} risk scores.`
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
