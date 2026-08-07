"""Rule-based fraud detection. Pure functions, no IO — every rule takes a list of
transaction dicts (see db.fetch_flagged_transactions for the shape) and returns a
list of detected-case dicts (severity/pattern/agent/confidence/amount/propertyId).
"""

DUPLICATE_REFUND_BASE = 80
AFTER_HOURS_RATE_OVERRIDE_BASE = 65
CASH_VARIANCE_BASE = 60
DISCOUNT_BASE = 60

CASH_VARIANCE_THRESHOLD = 500
DISCOUNT_THRESHOLD = 1300


def clamp(value, lo, hi):
    return max(lo, min(hi, value))


def severity_from_confidence(confidence):
    if confidence >= 90:
        return 'CRITICAL'
    if confidence >= 75:
        return 'HIGH'
    return 'MEDIUM'


def _make_case(pattern, agent, confidence, amount, property_id):
    confidence = clamp(round(confidence), 1, 99)
    return {
        'severity': severity_from_confidence(confidence),
        'pattern': pattern,
        'agent': agent,
        'confidence': confidence,
        'amount': amount,
        'propertyId': property_id,
    }


def rule_duplicate_refund(transactions):
    by_property_agent = {}
    for t in transactions:
        if t['type'] != 'Refund':
            continue
        key = (t['propertyId'], t['agent'])
        by_property_agent.setdefault(key, []).append(t)

    cases = []
    for (property_id, agent), txns in by_property_agent.items():
        if len(txns) < 2:
            continue
        # every occurrence beyond the first is treated as a duplicate
        for t in txns[1:]:
            amount = abs(float(t['amount']))
            confidence = DUPLICATE_REFUND_BASE + min(15, amount / 200)
            cases.append(_make_case('Duplicate refund issued', agent, confidence, amount, property_id))
    return cases


def rule_after_hours_rate_override(transactions):
    cases = []
    for t in transactions:
        if t['type'] != 'Rate override':
            continue
        hour = t['postedAt'].hour
        if 6 <= hour < 23:
            continue
        amount = abs(float(t['amount']))
        confidence = AFTER_HOURS_RATE_OVERRIDE_BASE + min(30, (amount - 1500) / 150)
        cases.append(_make_case('After-hours rate override', t['agent'], confidence, amount, t['propertyId']))
    return cases


def rule_cash_variance(transactions):
    cases = []
    for t in transactions:
        if t['type'] != 'Cash close':
            continue
        amount = abs(float(t['amount']))
        if amount <= CASH_VARIANCE_THRESHOLD:
            continue
        confidence = CASH_VARIANCE_BASE + min(30, (amount - CASH_VARIANCE_THRESHOLD) / 13)
        cases.append(_make_case('Cash variance at close', t['agent'], confidence, amount, t['propertyId']))
    return cases


def rule_discount_above_threshold(transactions):
    cases = []
    for t in transactions:
        if t['type'] != 'Discount':
            continue
        amount = abs(float(t['amount']))
        if amount <= DISCOUNT_THRESHOLD:
            continue
        confidence = DISCOUNT_BASE + min(30, (amount - DISCOUNT_THRESHOLD) / 30)
        cases.append(_make_case('Discount above threshold', t['agent'], confidence, amount, t['propertyId']))
    return cases


RULES = [
    rule_duplicate_refund,
    rule_after_hours_rate_override,
    rule_cash_variance,
    rule_discount_above_threshold,
]


def run_all_rules(transactions):
    cases = []
    for rule in RULES:
        cases.extend(rule(transactions))
    return cases
