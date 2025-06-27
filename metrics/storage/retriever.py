"""
retriever.py
Handles fetching raw sensor sample data needed for metric computation.

@tbd:
- Implement actual DB queries or API calls to fetch raw time-series samples.
- Handle connection pooling, query parameterization, and error handling.
- Support multiple asset/application types by calling respective DB functions/views.
"""

from typing import Any
import pandas as pd
import psycopg2
import psycopg2.extras
from psycopg2 import sql

class Retriever:
    def __init__(self, config: Any):
        self.config = config
        self.conn = self._connect_db()

    def _connect_db(self):
        """
        Establish DB connection using config details.
        @tbd: Replace placeholders with real connection code.
        """
        try:
            conn = psycopg2.connect(
                host=self.config.get("db_host", "localhost"),
                port=self.config.get("db_port", 5432),
                dbname=self.config.get("db_name", "metricsdb"),
                user=self.config.get("db_user", "user"),
                password=self.config.get("db_password", "password")
            )
            return conn
        except Exception as e:
            # @tbd: Use logging
            print(f"Error connecting to DB: {e}")
            raise

    def get_rawdata(self, tid: str, sid: int, sdt: str, edt: str, apptype: str = "trend", res: str = "hourly") -> pd.DataFrame:
        """
        Retrieve raw sensor samples for tenant, sensor, time range, and asset type.

        Args:
            tid: Tenant ID
            sid: Sensor ID
            sdt: Start datetime (ISO string)
            edt: End datetime (ISO string)
            apptype: Asset/Application type (e.g. alarm, energy, trend, crenv, creqp)
            res: Resolution (e.g. hourly, daily)

        Returns:
            pd.DataFrame with columns like ['timeofsample', 'samplevalue', 'expectedcount', ...]
        """
        # Map app type to DB function or table name
        dsmodel_map = {
            "alarm": "dsmodel_alarm_rawafct",
            "energy": "dsmodel_energy_rawafct",
            "trend": "dsmodel_trend_rawafct",
            "crenv": "dsmodel_crenv_rawafct",
            "creqp": "dsmodel_creqp_rawafct"
        }

        dsmodel_func = dsmodel_map.get(apptype.lower())
        if not dsmodel_func:
            raise ValueError(f"Unsupported apptype '{apptype}'")

        query = sql.SQL("""
            SELECT * FROM {func}(%s, %s, %s, %s, %s);
        """).format(func=sql.Identifier(dsmodel_func))

        params = (sid, tid, sdt, edt, res)

        try:
            with self.conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
                cur.execute(query, params)
                rows = cur.fetchall()
                if not rows:
                    return pd.DataFrame()  # empty dataframe if no data
                
                # Convert to DataFrame with column names
                df = pd.DataFrame(rows, columns=[desc[0] for desc in cur.description])
                return df

        except Exception as e:
            # @tbd: add proper logging here
            print(f"Error fetching raw data: {e}")
            raise
