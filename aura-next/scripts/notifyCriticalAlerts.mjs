import { config as loadEnv } from 'dotenv';
loadEnv({ path: '.env.local' });

import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function buildMessage(alert) {
  return `[CRITICAL] ${alert.title}\n${alert.meta}\nProperty: ${alert.property.name}`;
}

async function sendTelegramMessage(botToken, chatId, text) {
  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
  return res.ok;
}

async function main() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!botToken) throw new Error('TELEGRAM_BOT_TOKEN is not set');
  if (!chatId) throw new Error('TELEGRAM_CHAT_ID is not set');

  const alerts = await prisma.alert.findMany({
    where: { severity: 'CRITICAL', notifiedAt: null },
    include: { property: true },
    orderBy: { createdAt: 'asc' },
  });

  let sent = 0;
  let failed = 0;

  // sequential, not Promise.all — a fixed handful of CRITICAL alerts doesn't need
  // parallelism, and this naturally rate-limits calls to Telegram's API
  for (const alert of alerts) {
    try {
      const ok = await sendTelegramMessage(botToken, chatId, buildMessage(alert));
      if (!ok) throw new Error('Telegram API returned a non-OK response');
      await prisma.alert.update({ where: { id: alert.id }, data: { notifiedAt: new Date() } });
      sent += 1;
    } catch (err) {
      failed += 1;
      console.error(`Failed to notify alert ${alert.id} (${alert.title}): ${err.message}`);
    }
  }

  console.log(`Found ${alerts.length} unnotified CRITICAL alerts: ${sent} sent, ${failed} failed.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
