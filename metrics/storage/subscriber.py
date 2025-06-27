"""
subscriber.py

Handles reading precomputed metric sets from PostgreSQL storage.
Supports dispatching based on asset type and metric resolution.

@tbd:
- Add connection pooling or reuse.
- Handle stale or expired cache logic.
- Add logging instead of print.
"""

import psycopg2
import pandas as pd
from typing import Any


class Subscriber:
    def __init__(self, config: Any):
        self.config = config
        self.conn = self._connect_db()

    def _connect_db(self):
        try:
            return psycopg2.connect(
                host=self.config['db_host'],
                database=self.config['db_name'],
                user=self.config['db_user'],
                password=self.config['db_password'],
                port=self.config.get('db_port', 5432)
            )
        except Exception as e:
            # @tbd: Use proper logging
            print(f"[ERROR] Subscriber DB connection: {e}")
            raise

    def get_metrics(self, tid: str, sid: int, sdt, edt, res: str = "hourly", asset_type: str = "trend") -> pd.DataFrame:
        """
        Retrieve cached metrics for a given time window, resolution, and asset type.

        Args:
            tid: Tenant ID (can be used in SQL if needed)
            sid: Sensor ID
            sdt: Start datetime
            edt: End datetime
            res: Resolution level (e.g., hourly, daily)
            asset_type: Source data type (e.g., trend, energy, alarm, crenv, creqp)

        Returns:
            pd.DataFrame of cached metrics (empty if none found or error)
        """
        try:
            # Assuming the DB function signature matches (asset_type, sid, sdt, edt, res)
            sql = "SELECT * FROM dsmodel_metrics_cacheafct(%s, %s, %s, %s, %s);"
            with self.conn.cursor() as cur:
                cur.execute(sql, (asset_type, sid, sdt, edt, res))
                rows = cur.fetchall()
                if not rows:
                    return pd.DataFrame()
                colnames = [desc[0] for desc in cur.description]
                return pd.DataFrame(rows, columns=colnames)

        except Exception as e:
            # @tbd: Replace print with proper logging
            print(f"[ERROR] Subscriber.get_metrics: {e}")
            return pd.DataFrame()
