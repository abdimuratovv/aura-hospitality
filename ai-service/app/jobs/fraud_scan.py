from app.db import fetch_flagged_transactions, replace_detected_fraud_cases
from app.rules import run_all_rules


def run():
    transactions = fetch_flagged_transactions()
    cases = run_all_rules(transactions)
    replace_detected_fraud_cases(cases)

    by_pattern = {}
    for case in cases:
        by_pattern[case['pattern']] = by_pattern.get(case['pattern'], 0) + 1

    return {
        'transactions_scanned': len(transactions),
        'cases_detected': len(cases),
        'by_pattern': by_pattern,
    }


if __name__ == '__main__':
    result = run()
    print(f"Scanned {result['transactions_scanned']} transactions, detected {result['cases_detected']} fraud cases.")
    for pattern, count in result['by_pattern'].items():
        print(f"  {pattern}: {count}")
