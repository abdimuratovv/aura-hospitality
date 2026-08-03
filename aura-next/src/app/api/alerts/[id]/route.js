import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db.js';
import { getSession } from '@/lib/session.js';
import { getAccessiblePropertyIds } from '@/lib/access.js';
import { serializeAlert } from '@/lib/serializers.js';

const VALID_STATUSES = ['OPEN', 'ACKNOWLEDGED', 'RESOLVED'];

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

  const existing = await prisma.alert.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const propertyIds = await getAccessiblePropertyIds(session.id);
  if (!propertyIds.includes(existing.propertyId)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const alert = await prisma.alert.update({
    where: { id },
    data: { status: body.status },
  });

  return NextResponse.json(serializeAlert(alert));
}
