"""
@tbd: Core KPI computation logic for sensor data.

Instructions:
- Implement functions that calculate various KPIs from raw data.
- Use pandas, numpy for statistical calculations.
- Keep functions pure and testable.
"""

import pandas as pd

def compute_metrics(tid: str, sid: int, df: pd.DataFrame, sdt: str, edt: str):
    """
    Compute KPIs for given time series dataframe.
    @tbd: implement the detailed metrics calculation as per design doc.
    """
    # Placeholder: return empty list/dict or dummy metrics
    metrics = []
    # Example metric stub
    metrics.append({
        "tid": tid,
        "sid": sid,
        "metric_name": "Actual_Count",
        "metric_value": len(df),
        "sdt": sdt,
        "edt": edt,
    })
    return metrics
