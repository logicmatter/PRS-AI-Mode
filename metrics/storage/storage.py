"""
storage.py

MetricsStorage is a facade for Retriever, Subscriber, and Publisher,
centralizing access to raw data and metrics persistence.

@tbd:
- Add optional logging.
- Handle exception forwarding or unified error handling.
- Integrate with async or background queue in future versions.
"""

from typing import Any
from .retriever import Retriever
from .subscriber import Subscriber
from .publisher import Publisher
import pandas as pd


class MetricsStorage:
    def __init__(self, config: Any):
        """
        Initialize subcomponents for metric lifecycle management.
        
        Args:
            config: Dictionary or config object with DB connection info.
        """
        self.config = config
        self.retriever = Retriever(config)
        self.subscriber = Subscriber(config)
        self.publisher = Publisher(config)

    def get_raw_samples(self, tid: str, sid: int, sdt, edt, res: str, asset_type: str) -> pd.DataFrame:
        """
        Fetch raw data samples for computing metrics.

        Args:
            tid: Tenant ID (unused currently)
            sid: Sensor ID
            sdt: Start datetime
            edt: End datetime
            res: Resolution
            asset_type: 'trend', 'alarm', 'energy', etc.

        Returns:
            DataFrame of raw sample values
        """
        return self.retriever.get_rawdata(tid, sid, sdt, edt, res, asset_type)

    def get_metrics(self, tid: str, sid: int, sdt, edt, res: str, asset_type: str) -> pd.DataFrame:
        """
        Retrieve cached metrics if available.

        Args:
            tid: Tenant ID (unused)
            sid: Sensor ID
            sdt: Start datetime
            edt: End datetime
            res: Resolution (e.g. 'hourly')
            asset_type: 'trend', 'alarm', etc.

        Returns:
            DataFrame of metrics or empty DataFrame if not found.
        """
        return self.subscriber.get_metrics(tid, sid, sdt, edt, res, asset_type)

    def save_metrics(self, tid: str, sid: int, sdt, edt, res: str, metrics_dataset: pd.DataFrame, asset_type: str):
        """
        Store newly computed metrics.

        Args:
            tid: Tenant ID (unused in current storage logic)
            sid: Sensor ID
            sdt: Start datetime
            edt: End datetime
            res: Resolution
            metrics_dataset: DataFrame containing metric_name, metric_value
            asset_type: Type of asset for metric table routing
        """
        self.publisher.save_metrics(tid, sid, sdt, edt, metrics_dataset, res, asset_type)
