import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db.js';
import { getSession } from '@/lib/session.js';
import { getAccessiblePropertyIds } from '@/lib/access.js';
import { serializeFraudCase } from '@/lib/serializers.js';

const VALID_STATUSES = ['OPEN', 'INVESTIGATING', 'RESOLVED', 'FALSE_POSITIVE'];

export async function PATCH(request, { params }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  if (!VALID_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const existing = await prisma.fraudCase.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const propertyIds = await getAccessiblePropertyIds(session.id);
  if (!propertyIds.includes(existing.propertyId)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const updated = await prisma.fraudCase.update({
    where: { id },
    data: { status: body.status },
    include: { property: true },
  });

  return NextResponse.json(serializeFraudCase(updated));
}
