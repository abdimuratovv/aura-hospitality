"""All raw SQL/psycopg2 IO lives here — the one place that would need to change if
the driver is ever swapped later (asyncpg/SQLAlchemy).
"""

import os
import uuid

import psycopg2
import psycopg2.extras
from dotenv import load_dotenv

load_dotenv()

# The only transaction types any rule in rules.py looks at — narrows the scan
# instead of pulling every Transaction row on each run.
RULE_RELEVANT_TYPES = ['Refund', 'Rate override', 'Cash close', 'Discount']


def get_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def fetch_flagged_transactions():
    conn = get_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(
                '''SELECT id, "propertyId", "postedAt", type, agent, amount
                   FROM "Transaction"
                   WHERE type = ANY(%s)''',
                (RULE_RELEVANT_TYPES,),
            )
            return cur.fetchall()
    finally:
        conn.close()


def replace_detected_fraud_cases(cases):
    """Deletes every source='DETECTED' FraudCase row and reinserts `cases`, atomically.
    Mirrors seed.mjs's delete-then-recreate idempotency convention. FraudCase.id has
    no Postgres-level default (@default(cuid()) is generated client-side by Prisma,
    never pushed into the DB as a DEFAULT), so we generate our own id here.
    """
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM \"FraudCase\" WHERE source = 'DETECTED'")
            for case in cases:
                cur.execute(
                    '''INSERT INTO "FraudCase"
                       (id, severity, pattern, agent, confidence, amount, status, "propertyId", source)
                       VALUES (%s, %s, %s, %s, %s, %s, 'OPEN', %s, 'DETECTED')''',
                    (
                        str(uuid.uuid4()),
                        case['severity'],
                        case['pattern'],
                        case['agent'],
                        case['confidence'],
                        case['amount'],
                        case['propertyId'],
                    ),
                )
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
