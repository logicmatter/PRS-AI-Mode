"""
publisher.py

Handles saving metrics back to PostgreSQL for future reuse.
Performs delete+insert pattern for (tid, sid, sdt, edt, res, asset_type) scope.

@tbd:
- Use UPSERT if applicable.
- Ensure transaction safety.
- Validate data schema before write.
- Replace print statements with proper logging.
"""

import psycopg2
import pandas as pd
from typing import Any


class Publisher:
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
            # @tbd: replace with logging
            print(f"[ERROR] Publisher DB connection: {e}")
            raise

    def save_metrics(self, tid: str, sid: int, sdt, edt, metrics_df: pd.DataFrame, res: str = "hourly", asset_type: str = "trend"):
        """
        Save computed metrics to the database. Deletes any existing cache first.

        Args:
            tid: Tenant ID
            sid: Sensor ID
            sdt: Start datetime
            edt: End datetime
            metrics_df: DataFrame of computed KPIs
            res: Resolution (e.g., hourly, daily)
            asset_type: Asset classification (e.g., trend, alarm, crenv)

        @tbd:
            - Add schema validation before writing.
            - Handle failure gracefully.
        """
        try:
            with self.conn.cursor() as cur:
                # Step 1: Delete existing metrics for the same key
                delete_sql = """
                    DELETE FROM metrics
                    WHERE tid = %s AND sid = %s AND sdt = %s AND edt = %s AND resolution = %s AND asset_type = %s
                """
                cur.execute(delete_sql, (tid, sid, sdt, edt, res, asset_type))

                # Step 2: Insert new metrics
                insert_sql = """
                    INSERT INTO metrics (tid, sid, sdt, edt, resolution, asset_type, metric_name, metric_value)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """
                for _, row in metrics_df.iterrows():
                    cur.execute(insert_sql, (
                        tid,
                        sid,
                        sdt,
                        edt,
                        res,
                        asset_type,
                        row["metric_name"],
                        row["metric_value"]
                    ))

            self.conn.commit()
        except Exception as e:
            # @tbd: replace print with proper logging
            print(f"[ERROR] Publisher.save_metrics: {e}")
            self.conn.rollback()
