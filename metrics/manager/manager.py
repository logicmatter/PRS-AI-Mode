import pandas as pd
from typing import Optional
from generator import MetricsGenerator  # your KPI computation class
from kpis import kpi_list
from storage import MetricsStorage  # unified retriever, subscriber, publisher facade

class MetricsManager:
    def __init__(self, config):
        self.config = config
        self.storage = MetricsStorage(config)
        self.generator = MetricsGenerator(config)

    def get_metrics(self, tid: str, sid: int, sdt: str, edt: str, apptype: str = "trend", res: str = "hourly") -> pd.DataFrame:
        """
        Get cached metrics or compute if missing.

        Args:
            tid: Tenant ID
            sid: Sensor ID
            sdt: Start datetime (ISO string)
            edt: End datetime (ISO string)
            apptype: Asset/application type (e.g. alarm, energy, trend)
            res: Resolution (hourly, daily, etc.)

        Returns:
            pd.DataFrame of KPIs
        """
        cached_df = self.storage.subscriber.get_metrics(tid, sid, sdt, edt, res, apptype)
        if cached_df is not None and not cached_df.empty:
            return cached_df

        raw_df = self.storage.retriever.get_rawdata(tid, sid, sdt, edt, apptype)

        # @tbd: retrieve previous mean or historical context if needed
        computed_df = self.generator.generate(
            tid=tid, sid=sid, df=raw_df, sdt=sdt, edt=edt, resolution=res, previous_mean=None
        )

        # Filter metrics based on approved KPI list
        computed_df = computed_df[computed_df["metric_name"].isin(kpi_list)]

        self.put_metrics(tid, sid, sdt, edt, res, computed_df, apptype)

        return computed_df

    def put_metrics(self, tid: str, sid: int, sdt: str, edt: str, res: str, metrics_dataset: pd.DataFrame, apptype: str):
        self.storage.publisher.save_metrics(tid, sid, sdt, edt, res, metrics_dataset, apptype)
