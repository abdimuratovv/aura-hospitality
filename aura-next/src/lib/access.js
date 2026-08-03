import { prisma } from './db.js';

export async function getAccessiblePropertyIds(userId) {
  const rows = await prisma.userProperty.findMany({
    where: { userId },
    select: { propertyId: true },
  });
  return rows.map((r) => r.propertyId);
}

// Narrows an already-computed accessible-property list down to a single requested
// property, ignoring the request if it falls outside what the caller can see —
// the security boundary is always the accessible set, this is just a display filter.
export function resolvePropertyIds(accessiblePropertyIds, requestedPropertyId) {
  if (requestedPropertyId && accessiblePropertyIds.includes(requestedPropertyId)) {
    return [requestedPropertyId];
  }
  return accessiblePropertyIds;
}
