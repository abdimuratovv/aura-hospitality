import { prisma } from './db.js';

export async function getAccessiblePropertyIds(userId) {
  const rows = await prisma.userProperty.findMany({
    where: { userId },
    select: { propertyId: true },
  });
  return rows.map((r) => r.propertyId);
}
