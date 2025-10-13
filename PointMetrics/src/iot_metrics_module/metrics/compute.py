"""Metrics computation engine"""

from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
import pandas as pd
import numpy as np

from ..config.config import Config
from ..data.loader import DataLoader
from ..utils.logger import get_context_logger
from ..utils.helpers import calculate_expected_count
from .kpi_definitions import get_kpi_registry, KPIRegistry


class MetricsCompute:
    """
    Metrics computation engine for calculating KPIs from raw sensor data
    """

    def __init__(self, config: Config, data_loader: DataLoader):
        """
        Initialize MetricsCompute

        Args:
            config: Configuration object
            data_loader: DataLoader instance
        """
        self.config = config
        self.data_loader = data_loader
        self.kpi_registry = get_kpi_registry()
        self.logger = get_context_logger('metrics.compute')

        # Get enabled KPIs based on configuration
        self.enabled_kpis = self.kpi_registry.get_enabled_kpis(config)

        self.logger.info(f"MetricsCompute initialized with {len(self.enabled_kpis)} enabled KPIs")

    def compute_metrics_for_sensor(
        self,
        sid: int,
        tid: str,
        samples_df: pd.DataFrame,
        year: int,
        day_number: int,
        time_bucket_no: int
    ) -> List[Dict[str, Any]]:
        """
        Compute all enabled KPIs for a single sensor

        Args:
            sid: Sensor ID
            tid: Tenant ID
            samples_df: DataFrame with samples for this sensor
            year: Year
            day_number: Day of year
            time_bucket_no: Time bucket number

        Returns:
            List of metric dictionaries
        """
        logger = get_context_logger('metrics.compute', tid=tid, sid=sid)

        try:
            # Extract values from DataFrame
            if samples_df.empty or 'PresentValue' not in samples_df.columns:
                logger.warning(f"No samples for sensor {sid}, using empty array")
                values = np.array([])
            else:
                values = samples_df['PresentValue'].dropna().values

            # Get expected count for this sensor
            expected_count = calculate_expected_count(
                self.data_loader.get_sensor_expected_count(sid),
                self.config.metrics.bucket_interval_minutes
            )

            # Build context for KPI computation
            context = {
                'expected_count': expected_count,
                'flatline_threshold': self.config.metrics.flatline_threshold,
                'outlier_zscore_threshold': self.config.metrics.outlier_zscore_threshold,
                'tid': tid,
                'sid': sid,
                'year': year,
                'day_number': day_number,
                'time_bucket_no': time_bucket_no
            }

            # Compute all enabled KPIs
            metrics = []
            for kpi_name in self.enabled_kpis:
                kpi_def = self.kpi_registry.get_kpi(kpi_name)
                if kpi_def is None:
                    logger.warning(f"KPI definition not found: {kpi_name}")
                    continue

                try:
                    # Compute metric value
                    metric_value = kpi_def.compute_func(values, context)

                    metrics.append({
                        'tid': tid,
                        'sid': sid,
                        'metric_name': kpi_name,
                        'metric_category': kpi_def.category,
                        'metric_value': metric_value,
                        'unit': kpi_def.unit,
                        'description': kpi_def.description,
                        'year': year,
                        'day_number': day_number,
                        'time_bucket_no': time_bucket_no
                    })

                except Exception as e:
                    logger.error(f"Error computing {kpi_name} for sensor {sid}: {e}")
                    # Store as null value
                    metrics.append({
                        'tid': tid,
                        'sid': sid,
                        'metric_name': kpi_name,
                        'metric_category': kpi_def.category,
                        'metric_value': np.nan,
                        'unit': kpi_def.unit,
                        'description': kpi_def.description,
                        'year': year,
                        'day_number': day_number,
                        'time_bucket_no': time_bucket_no
                    })

            logger.debug(f"Computed {len(metrics)} metrics for sensor {sid}")
            return metrics

        except Exception as e:
            logger.error(f"Error in compute_metrics_for_sensor for sid={sid}: {e}")
            return []

    def compute_metrics_for_bucket(
        self,
        year: int,
        day_number: int,
        time_bucket_no: int,
        tid: Optional[str] = None,
        sids: Optional[List[int]] = None
    ) -> pd.DataFrame:
        """
        Compute metrics for all sensors in a time bucket

        Args:
            year: Year
            day_number: Day of year
            time_bucket_no: Time bucket number
            tid: Tenant ID filter (optional)
            sids: Sensor IDs filter (optional)

        Returns:
            DataFrame with computed metrics
        """
        logger = get_context_logger(
            'metrics.compute',
            year=year,
            day=day_number,
            bucket=time_bucket_no
        )

        try:
            # Fetch and group samples by sensor
            grouped_samples = self.data_loader.fetch_and_group_by_sensor(
                year, day_number, time_bucket_no,
                tid=tid, sids=sids
            )

            if not grouped_samples:
                logger.warning("No samples found for bucket")
                return pd.DataFrame()

            # Compute metrics for each sensor
            all_metrics = []

            if self.config.parallel_processing and len(grouped_samples) > 1:
                # Parallel processing
                with ThreadPoolExecutor(max_workers=self.config.max_workers) as executor:
                    futures = {}
                    for sid, samples_df in grouped_samples.items():
                        # Get tid from samples or use provided tid
                        sensor_tid = samples_df['tid'].iloc[0] if 'tid' in samples_df.columns else tid

                        future = executor.submit(
                            self.compute_metrics_for_sensor,
                            sid, sensor_tid, samples_df,
                            year, day_number, time_bucket_no
                        )
                        futures[future] = sid

                    for future in as_completed(futures):
                        sid = futures[future]
                        try:
                            metrics = future.result()
                            all_metrics.extend(metrics)
                        except Exception as e:
                            logger.error(f"Error processing sensor {sid}: {e}")
            else:
                # Sequential processing
                for sid, samples_df in grouped_samples.items():
                    sensor_tid = samples_df['tid'].iloc[0] if 'tid' in samples_df.columns else tid

                    metrics = self.compute_metrics_for_sensor(
                        sid, sensor_tid, samples_df,
                        year, day_number, time_bucket_no
                    )
                    all_metrics.extend(metrics)

            if not all_metrics:
                return pd.DataFrame()

            # Convert to DataFrame
            metrics_df = pd.DataFrame(all_metrics)
            logger.info(
                f"Computed {len(all_metrics)} metrics for {len(grouped_samples)} sensors"
            )

            return metrics_df

        except Exception as e:
            logger.error(f"Error in compute_metrics_for_bucket: {e}")
            raise

    def compute_metrics_for_multiple_buckets(
        self,
        bucket_coords: List[Tuple[int, int, int]],
        tid: Optional[str] = None,
        sids: Optional[List[int]] = None
    ) -> pd.DataFrame:
        """
        Compute metrics for multiple time buckets

        Args:
            bucket_coords: List of (year, day_number, time_bucket_no) tuples
            tid: Tenant ID filter (optional)
            sids: Sensor IDs filter (optional)

        Returns:
            DataFrame with computed metrics for all buckets
        """
        self.logger.info(f"Computing metrics for {len(bucket_coords)} buckets")

        all_metrics_dfs = []

        for year, day_number, time_bucket_no in bucket_coords:
            try:
                metrics_df = self.compute_metrics_for_bucket(
                    year, day_number, time_bucket_no,
                    tid=tid, sids=sids
                )
                if not metrics_df.empty:
                    all_metrics_dfs.append(metrics_df)
            except Exception as e:
                self.logger.error(
                    f"Error computing metrics for bucket "
                    f"({year}, {day_number}, {time_bucket_no}): {e}"
                )

        if not all_metrics_dfs:
            return pd.DataFrame()

        # Concatenate all dataframes
        combined_df = pd.concat(all_metrics_dfs, ignore_index=True)
        self.logger.info(f"Computed total of {len(combined_df)} metrics")

        return combined_df

    def get_metric_summary(
        self,
        metrics_df: pd.DataFrame
    ) -> Dict[str, Any]:
        """
        Get summary statistics for computed metrics

        Args:
            metrics_df: DataFrame with computed metrics

        Returns:
            Dictionary with summary statistics
        """
        if metrics_df.empty:
            return {
                'total_metrics': 0,
                'sensors_count': 0,
                'categories': {}
            }

        summary = {
            'total_metrics': len(metrics_df),
            'sensors_count': metrics_df['sid'].nunique() if 'sid' in metrics_df.columns else 0,
            'tenants_count': metrics_df['tid'].nunique() if 'tid' in metrics_df.columns else 0,
            'null_values': int(metrics_df['metric_value'].isna().sum()),
            'null_percentage': float(metrics_df['metric_value'].isna().mean() * 100),
            'categories': {}
        }

        # Summary by category
        if 'metric_category' in metrics_df.columns:
            for category, group in metrics_df.groupby('metric_category'):
                summary['categories'][category] = {
                    'count': len(group),
                    'null_count': int(group['metric_value'].isna().sum())
                }

        return summary

    def validate_metrics(
        self,
        metrics_df: pd.DataFrame
    ) -> Tuple[bool, List[str]]:
        """
        Validate computed metrics

        Args:
            metrics_df: DataFrame with computed metrics

        Returns:
            Tuple of (is_valid, list of issues)
        """
        issues = []

        # Check required columns
        required_columns = [
            'tid', 'sid', 'metric_name', 'metric_category',
            'metric_value', 'year', 'day_number', 'time_bucket_no'
        ]

        missing_columns = set(required_columns) - set(metrics_df.columns)
        if missing_columns:
            issues.append(f"Missing required columns: {missing_columns}")

        # Check for excessive null values
        if not metrics_df.empty:
            null_pct = metrics_df['metric_value'].isna().mean() * 100
            if null_pct > 50:
                issues.append(f"High percentage of null values: {null_pct:.1f}%")

        # Check for duplicate metrics (same sensor, time, metric)
        if not metrics_df.empty and 'metric_name' in metrics_df.columns:
            duplicates = metrics_df.duplicated(
                subset=['tid', 'sid', 'year', 'day_number', 'time_bucket_no', 'metric_name']
            )
            if duplicates.any():
                issues.append(f"Found {duplicates.sum()} duplicate metrics")

        is_valid = len(issues) == 0
        return is_valid, issues

    def get_kpi_list(self) -> List[Dict[str, str]]:
        """
        Get list of all available KPIs

        Returns:
            List of dictionaries with KPI info
        """
        kpis = []
        for kpi_name in self.kpi_registry.get_all_kpi_names():
            kpi_def = self.kpi_registry.get_kpi(kpi_name)
            kpis.append({
                'name': kpi_def.name,
                'category': kpi_def.category,
                'description': kpi_def.description,
                'unit': kpi_def.unit,
                'enabled': kpi_name in self.enabled_kpis
            })
        return kpis
