import datetime

from app.rules import (
    clamp,
    rule_after_hours_rate_override,
    rule_cash_variance,
    rule_discount_above_threshold,
    rule_duplicate_refund,
    run_all_rules,
    severity_from_confidence,
)


def txn(type_, amount, agent='M. Alvarez', property_id='prop-1', hour=12):
    return {
        'id': 'txn-1',
        'propertyId': property_id,
        'postedAt': datetime.datetime(2026, 8, 5, hour, 0, 0),
        'type': type_,
        'agent': agent,
        'amount': amount,
    }


def test_clamp():
    assert clamp(150, 0, 99) == 99
    assert clamp(-5, 0, 99) == 0
    assert clamp(50, 0, 99) == 50


def test_severity_from_confidence():
    assert severity_from_confidence(95) == 'CRITICAL'
    assert severity_from_confidence(80) == 'HIGH'
    assert severity_from_confidence(60) == 'MEDIUM'


def test_duplicate_refund_needs_two_same_property_and_agent():
    single = [txn('Refund', -1000, agent='A')]
    assert rule_duplicate_refund(single) == []

    duplicate = [
        txn('Refund', -1000, agent='A'),
        txn('Refund', -1200, agent='A'),
    ]
    cases = rule_duplicate_refund(duplicate)
    assert len(cases) == 1
    assert cases[0]['pattern'] == 'Duplicate refund issued'

    different_agents = [
        txn('Refund', -1000, agent='A'),
        txn('Refund', -1200, agent='B'),
    ]
    assert rule_duplicate_refund(different_agents) == []


def test_after_hours_rate_override():
    daytime = [txn('Rate override', 3000, hour=14)]
    assert rule_after_hours_rate_override(daytime) == []

    night = [txn('Rate override', 3000, hour=3)]
    cases = rule_after_hours_rate_override(night)
    assert len(cases) == 1
    assert cases[0]['pattern'] == 'After-hours rate override'


def test_cash_variance_threshold():
    below = [txn('Cash close', -400)]
    assert rule_cash_variance(below) == []

    above = [txn('Cash close', -700)]
    cases = rule_cash_variance(above)
    assert len(cases) == 1


def test_discount_above_threshold():
    below = [txn('Discount', -1000)]
    assert rule_discount_above_threshold(below) == []

    above = [txn('Discount', -1800)]
    cases = rule_discount_above_threshold(above)
    assert len(cases) == 1


def test_run_all_rules_combines_every_rule_and_ignores_others():
    transactions = [
        txn('Cash close', -700),
        txn('Discount', -1800),
        txn('Room posting', 1000),
    ]
    cases = run_all_rules(transactions)
    patterns = {c['pattern'] for c in cases}
    assert patterns == {'Cash variance at close', 'Discount above threshold'}
