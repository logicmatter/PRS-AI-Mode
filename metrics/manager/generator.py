"""
generator.py

Responsible for computing KPIs using raw sample data with pandas and numpy.

Features:
- Computes base, quality, shape, and trend KPIs
- Returns tidy DataFrame ready to be stored or displayed

@tbd:
- Break logic into modular methods (e.g., compute_base_metrics, compute_trend_kpis)
- Add logging and performance timers
- Support override of expected config via config or sensor model
"""

import pandas as pd
import numpy as np
from typing import Optional
from kpis import kpi_list


class MetricsGenerator:
    def __init__(self, config: dict):
        self.config = config

    def generate(
        self,
        tid: str,
        sid: int,
        df: pd.DataFrame,
        sdt,
        edt,
        resolution: str = "hourly",
        previous_mean: Optional[float] = None,
    ) -> pd.DataFrame:
        """
        Compute KPIs from raw sensor data.

        Args:
            tid: Tenant ID
            sid: Sensor ID
            df: DataFrame with raw samples
            sdt: Start time of window
            edt: End time of window
            resolution: Resolution level (e.g. 'hourly')
            previous_mean: Optional historical mean for drift/momentum

        Returns:
            pd.DataFrame: DataFrame with metric_name, metric_value, and context
        """
        metrics = []

        def add_metric(name, value):
            metrics.append({
                "metric_name": name,
                "metric_value": value,
                "tid": tid,
                "sid": sid,
                "sdt": sdt,
                "edt": edt,
                "resolution": resolution
            })

        # === Prepare Columns ===
        if 'samplevalue' not in df.columns or df['samplevalue'].dropna().empty:
            return pd.DataFrame()  # Skip if unusable data

        sv = df['samplevalue'].dropna()
        ec_conf = self.config.get("expected_config_count", None)
        ec_hist = df['expectedcount'].mean() if 'expectedcount' in df.columns else None

        # === Base KPIs ===
        add_metric("Actual_Count", len(sv))
        add_metric("Expected_Config_Count", ec_conf)
        add_metric("Expected_Hist_Count", ec_hist)
        add_metric("Coverage_Pct_Config", len(sv) * 100.0 / ec_conf if ec_conf else None)
        add_metric("Missing_Pct_Config", 100.0 - (len(sv) * 100.0 / ec_conf) if ec_conf else None)
        add_metric("Coverage_Pct_Hist", len(sv) * 100.0 / ec_hist if ec_hist else None)
        add_metric("Missing_Pct_Hist", 100.0 - (len(sv) * 100.0 / ec_hist) if ec_hist else None)

        # === Central Tendency & Range ===
        add_metric("Actual_Mean", sv.mean())
        add_metric("Actual_Median", sv.median())
        add_metric("Actual_Mode", sv.mode().iloc[0] if not sv.mode().empty else None)
        add_metric("Actual_Min", sv.min())
        add_metric("Actual_Max", sv.max())
        add_metric("Actual_Range", sv.max() - sv.min())

        # === Quality/Behavior ===
        add_metric("Flatline_Pct", (sv.diff().fillna(1) == 0).sum() * 100.0 / len(sv))
        add_metric("Outlier_Count", ((sv - sv.mean()).abs() > 3 * sv.std()).sum())
        add_metric("Value_Constant", 1 if sv.min() == sv.max() else 0)

        # === Distribution Shape ===
        add_metric("Stddev", sv.std())
        add_metric("Variance", sv.var())
        add_metric("IQR", sv.quantile(0.75) - sv.quantile(0.25))
        add_metric("Skewness", sv.skew())
        add_metric("Kurtosis", sv.kurtosis())
        add_metric("Percentile_95", sv.quantile(0.95))

        # === Trend Dynamics ===
        if 'timeofsample' in df.columns:
            df_sorted = df.sort_values('timeofsample')
            x = pd.to_datetime(df_sorted['timeofsample']).astype(np.int64) // 10**9
            y = df_sorted['samplevalue']

            if len(x) > 1:
                slope = np.polyfit(x, y, 1)[0]
                add_metric("Slope_Trend", slope)
            else:
                add_metric("Slope_Trend", None)
        else:
            add_metric("Slope_Trend", None)

        if previous_mean is not None and sv.std() > 0:
            add_metric("Drift_Score", (sv.mean() - previous_mean) / sv.std())
            add_metric("Momentum_Trend", sv.mean() - previous_mean)
        else:
            add_metric("Drift_Score", None)
            add_metric("Momentum_Trend", None)

        duration = (edt - sdt).total_seconds()
        add_metric("Rate_Change", (sv.max() - sv.min()) / duration if duration > 0 else None)
        add_metric("Zscore_Max", ((sv - sv.mean()).abs() / sv.std()).max() if sv.std() > 0 else None)

        result_df = pd.DataFrame(metrics)

        # Ensure only known KPIs are kept
        return result_df[result_df["metric_name"].isin(kpi_list)]
