import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db.js';
import { getSession } from '@/lib/session.js';
import { getAccessiblePropertyIds } from '@/lib/access.js';
import { serializeNightAuditRun } from '@/lib/serializers.js';

const VALID_STATUSES = ['DONE', 'WARNING', 'CRITICAL', 'PENDING'];

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

  const existing = await prisma.checklistItem.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const priorRun = await prisma.nightAuditRun.findUniqueOrThrow({
    where: { id: existing.nightAuditRunId },
  });

  const propertyIds = await getAccessiblePropertyIds(session.id);
  if (!propertyIds.includes(priorRun.propertyId)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await prisma.checklistItem.update({
    where: { id },
    data: { status: body.status },
  });

  // closeStepsCompleted tracks the broader close process, not just the items shown
  // in this checklist, so a status flip nudges it by one step rather than being
  // recomputed from an absolute count of DONE checklist rows.
  const wasDone = existing.status === 'DONE';
  const isDone = body.status === 'DONE';
  let closeStepsCompleted = priorRun.closeStepsCompleted;
  if (!wasDone && isDone) closeStepsCompleted = Math.min(priorRun.closeStepsTotal, closeStepsCompleted + 1);
  else if (wasDone && !isDone) closeStepsCompleted = Math.max(0, closeStepsCompleted - 1);
  const closeProgressPct = Math.round((closeStepsCompleted / priorRun.closeStepsTotal) * 100);

  const run = await prisma.nightAuditRun.update({
    where: { id: existing.nightAuditRunId },
    data: { closeStepsCompleted, closeProgressPct },
    include: { checklist: { orderBy: { order: 'asc' } } },
  });

  return NextResponse.json({ run: serializeNightAuditRun(run) });
}
