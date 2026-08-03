export function serializeFraudCase(c) {
  return {
    id: c.id,
    severity: c.severity,
    pattern: c.pattern,
    agent: c.agent,
    confidence: c.confidence,
    amount: Number(c.amount),
    status: c.status,
    property: { code: c.property.code, name: c.property.shortName },
  };
}

export function serializeAlert(a) {
  return {
    id: a.id,
    severity: a.severity,
    title: a.title,
    meta: a.meta,
    source: a.source,
    status: a.status,
    createdAt: a.createdAt,
  };
}
