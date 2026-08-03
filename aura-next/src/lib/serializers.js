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

export function serializeNightAuditRun(run) {
  return {
    id: run.id,
    date: run.date,
    propertyId: run.propertyId,
    closeStepsCompleted: run.closeStepsCompleted,
    closeStepsTotal: run.closeStepsTotal,
    openDiscrepancies: run.openDiscrepancies,
    discrepancyAmount: Number(run.discrepancyAmount),
    revenuePosted: Number(run.revenuePosted),
    transactionCount: run.transactionCount,
    closeProgressPct: run.closeProgressPct,
    estCompletionLabel: run.estCompletionLabel,
    checklist: run.checklist.map((c) => ({
      id: c.id,
      label: c.label,
      detail: c.detail,
      meta: c.meta,
      status: c.status,
    })),
  };
}
