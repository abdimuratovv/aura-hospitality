import { config as loadEnv } from 'dotenv';
loadEnv({ path: '.env.local' });

import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const properties = [
  { code: 'GM', name: 'The Grand Meridian' },
  { code: 'BS', name: 'Meridian Bayside' },
  { code: 'OT', name: 'Meridian Old Town' },
  { code: 'HB', name: 'Meridian Harbor' },
  { code: 'SM', name: 'Meridian Summit' },
  { code: 'RV', name: 'Meridian Riverside' },
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

async function main() {
  const passwordHash = await bcrypt.hash('aura-secure-2026', 10);

  await prisma.user.upsert({
    where: { email: 'e.reyes@meridianhotels.com' },
    update: {},
    create: {
      email: 'e.reyes@meridianhotels.com',
      passwordHash,
      name: 'Elena Reyes',
      role: 'Chief Financial Officer',
    },
  });

  const propertyRecords = [];
  for (const p of properties) {
    const rec = await prisma.property.upsert({
      where: { code: p.code },
      update: { name: p.name },
      create: p,
    });
    propertyRecords.push(rec);
  }

  await prisma.transaction.deleteMany({});

  const now = new Date();
  const rows = [];
  const COUNT = 32;
  for (let i = 0; i < COUNT; i++) {
    const template = pick(txnTemplates, i);
    const property = pick(propertyRecords, i * 3 + 1);
    const agent = template.type === 'Room posting' || template.type === 'City ledger' || template.type === 'Minibar' || template.type === 'Deposit' ? 'System' : pick(agents, i * 5 + 2);
    const postedAt = new Date(now.getTime() - i * 47 * 60 * 1000); // spaced ~47 min apart, walking backwards
    const amount = amountFor(template, i + 1);

    rows.push({
      folioId: `${property.code}-${88000 + i * 13}`,
      postedAt,
      type: template.type,
      agent,
      amount,
      flag: template.flag,
      propertyId: property.id,
    });
  }

  await prisma.transaction.createMany({ data: rows });

  console.log(`Seeded 1 user, ${propertyRecords.length} properties, ${rows.length} transactions.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
