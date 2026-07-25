import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db.js';
import { getSession } from '@/lib/session.js';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const reports = await prisma.reportDefinition.findMany({ orderBy: { order: 'asc' } });

  return NextResponse.json({
    rows: reports.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      frequency: r.frequency,
      lastUpdatedLabel: r.lastUpdatedLabel,
    })),
  });
}
