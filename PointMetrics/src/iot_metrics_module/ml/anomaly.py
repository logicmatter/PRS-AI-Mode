"""Anomaly detection for sensor metrics"""

from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime
import pandas as pd
import numpy as np
from scipy import stats

from ..config.config import Config
from ..utils.logger import get_context_logger
from ..utils.helpers import get_bucket_history_range


class AnomalyDetector:
    """
    Anomaly detection using historical baseline comparison
    """

    def __init__(self, config: Config):
        """
        Initialize anomaly detector

        Args:
            config: Configuration object
        """
        self.config = config
        self.logger = get_context_logger('ml.anomaly')

        self.anomaly_window_buckets = config.ml.anomaly_window_buckets
        self.zscore_threshold = config.ml.anomaly_zscore_threshold
        self.drift_threshold = config.metrics.anomaly_drift_threshold

        self.logger.info("AnomalyDetector initialized")

    def detect_anomalies(
        self,
        current_metrics_df: pd.DataFrame,
        historical_metrics_df: pd.DataFrame
    ) -> pd.DataFrame:
        """
        Detect anomalies by comparing current metrics to historical baseline

        Args:
            current_metrics_df: Current bucket metrics
            historical_metrics_df: Historical metrics for comparison

        Returns:
            DataFrame with anomaly labels
        """
        if current_metrics_df.empty:
            return pd.DataFrame()

        # Pivot current metrics to wide format
        current_pivot = current_metrics_df.pivot_table(
            index=['tid', 'sid'],
            columns='metric_name',
            values='metric_value',
            aggfunc='first'
        ).reset_index()

        # Pivot historical metrics
        if not historical_metrics_df.empty:
            hist_pivot = historical_metrics_df.pivot_table(
                index=['tid', 'sid'],
                columns='metric_name',
                values='metric_value',
                aggfunc='mean'  # Use mean of historical values
            )
        else:
            hist_pivot = pd.DataFrame()

        # Detect anomalies for each sensor
        anomaly_results = []

        for _, row in current_pivot.iterrows():
            tid = row['tid']
            sid = row['sid']

            # Get historical baseline for this sensor
            if not hist_pivot.empty and (tid, sid) in hist_pivot.index:
                hist_row = hist_pivot.loc[(tid, sid)]

                # Calculate drift scores
                anomaly_score = self._calculate_drift_score(row, hist_row)
                is_anomalous = anomaly_score > self.drift_threshold

                anomaly_results.append({
                    'tid': tid,
                    'sid': sid,
                    'Anomaly_Label': 'Anomalous' if is_anomalous else 'Expected',
                    'Anomaly_Score': anomaly_score,
                    'Drift_Score': anomaly_score
                })
            else:
                # No historical data - mark as unknown
                anomaly_results.append({
                    'tid': tid,
                    'sid': sid,
                    'Anomaly_Label': 'Unknown',
                    'Anomaly_Score': 0.0,
                    'Drift_Score': 0.0
                })

        result_df = pd.DataFrame(anomaly_results)
        self.logger.info(
            f"Detected {sum(result_df['Anomaly_Label'] == 'Anomalous')} anomalies "
            f"out of {len(result_df)} sensors"
        )

        return result_df

    def _calculate_drift_score(
        self,
        current_row: pd.Series,
        historical_row: pd.Series
    ) -> float:
        """
        Calculate drift score between current and historical metrics

        Args:
            current_row: Current metrics
            historical_row: Historical baseline metrics

        Returns:
            Drift score (higher = more anomalous)
        """
        # Select key metrics for drift calculation
        key_metrics = ['Coverage_Pct', 'Flatline_Pct', 'Outlier_Count', 'Stddev']

        drift_scores = []

        for metric in key_metrics:
            if metric in current_row.index and metric in historical_row.index:
                current_val = current_row[metric]
                hist_val = historical_row[metric]

                if pd.notna(current_val) and pd.notna(hist_val) and hist_val != 0:
                    # Calculate relative difference
                    diff = abs(current_val - hist_val) / abs(hist_val)
                    drift_scores.append(diff)

        if not drift_scores:
            return 0.0

        # Return mean drift score
        return np.mean(drift_scores)

    def flag_coverage_anomalies(
        self,
        metrics_df: pd.DataFrame
    ) -> pd.DataFrame:
        """
        Flag sensors with low coverage as anomalies

        Args:
            metrics_df: DataFrame with metrics

        Returns:
            DataFrame with coverage anomaly flags
        """
        # Filter to Coverage_Pct metric
        coverage_df = metrics_df[
            metrics_df['metric_name'] == 'Coverage_Pct'
        ].copy()

        if coverage_df.empty:
            return pd.DataFrame()

        # Flag low coverage
        threshold = self.config.metrics.coverage_min_threshold * 100  # Convert to percentage
        coverage_df['Low_Coverage_Anomaly'] = coverage_df['metric_value'] < threshold

        return coverage_df[['tid', 'sid', 'metric_value', 'Low_Coverage_Anomaly']]

    def flag_flatline_anomalies(
        self,
        metrics_df: pd.DataFrame
    ) -> pd.DataFrame:
        """
        Flag sensors with high flatline percentage as anomalies

        Args:
            metrics_df: DataFrame with metrics

        Returns:
            DataFrame with flatline anomaly flags
        """
        # Filter to Flatline_Pct metric
        flatline_df = metrics_df[
            metrics_df['metric_name'] == 'Flatline_Pct'
        ].copy()

        if flatline_df.empty:
            return pd.DataFrame()

        # Flag high flatline
        threshold = 50.0  # 50% flatline is anomalous
        flatline_df['High_Flatline_Anomaly'] = flatline_df['metric_value'] > threshold

        return flatline_df[['tid', 'sid', 'metric_value', 'High_Flatline_Anomaly']]

    def get_anomaly_summary(
        self,
        anomaly_df: pd.DataFrame
    ) -> Dict[str, Any]:
        """
        Get summary of anomaly detection results

        Args:
            anomaly_df: DataFrame with anomaly results

        Returns:
            Summary dictionary
        """
        if anomaly_df.empty:
            return {'total_sensors': 0, 'anomalous_count': 0}

        summary = {
            'total_sensors': len(anomaly_df),
            'anomalous_count': int(sum(anomaly_df['Anomaly_Label'] == 'Anomalous')),
            'expected_count': int(sum(anomaly_df['Anomaly_Label'] == 'Expected')),
            'unknown_count': int(sum(anomaly_df['Anomaly_Label'] == 'Unknown')),
            'anomaly_rate': float(sum(anomaly_df['Anomaly_Label'] == 'Anomalous') / len(anomaly_df) * 100),
            'avg_drift_score': float(anomaly_df['Drift_Score'].mean()) if 'Drift_Score' in anomaly_df else 0.0
        }

        return summary
