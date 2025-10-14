"""Parquet storage adapter for all data storage (metrics, logs, configurations)"""

from typing import Optional, List, Dict, Any
from pathlib import Path
from datetime import datetime
import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq
import json

from ..config.config import Config
from ..utils.logger import get_context_logger
from ..data.models import (
    DimSensor, FactSample, MetricValue, ComputationLog,
    MLModelVersion, TenantConfig
)


class ParquetStorageAdapter:
    """
    Unified Parquet storage adapter for all data storage needs
    Handles metrics, raw samples, logs, configurations, and ML models
    """

    def __init__(self, config: Config):
        """
        Initialize Parquet storage adapter

        Args:
            config: Configuration object
        """
        self.config = config
        self.logger = get_context_logger('storage.parquet')

        self.base_path = Path(config.storage.parquet_base_path)
        self.compression = config.storage.parquet_compression

        # Storage subdirectories
        self.metrics_path = self.base_path / "metrics"
        self.samples_path = self.base_path / "samples"
        self.sensors_path = self.base_path / "sensors"
        self.logs_path = self.base_path / "logs"
        self.ml_models_path = self.base_path / "ml_models"
        self.config_path = self.base_path / "config"

        # Create directory structure
        self._initialize_storage()

        self.logger.info(f"ParquetStorageAdapter initialized at {self.base_path}")

    def _initialize_storage(self):
        """Create storage directory structure"""
        for path in [
            self.metrics_path,
            self.samples_path,
            self.sensors_path,
            self.logs_path,
            self.ml_models_path,
            self.config_path
        ]:
            path.mkdir(parents=True, exist_ok=True)
            self.logger.debug(f"Created directory: {path}")

    # ==================== METRICS STORAGE ====================

    def get_metrics_file_path(
        self,
        year: int,
        month: int,
        tid: str,
        day_number: Optional[int] = None
    ) -> Path:
        """
        Get metrics file path

        Args:
            year: Year
            month: Month
            tid: Tenant ID
            day_number: Optional day number for daily partitioning

        Returns:
            Path object
        """
        # Structure: metrics/year=YYYY/month=MM/tid=XXX/[day=DDD/]metrics.parquet
        base = self.metrics_path / f"year={year}" / f"month={month:02d}" / f"tid={tid}"

        if day_number is not None:
            base = base / f"day={day_number:03d}"

        return base / "metrics.parquet"

    def write_metrics(self, metrics_df: pd.DataFrame) -> int:
        """
        Write metrics to Parquet files partitioned by year/month/tid/day

        Args:
            metrics_df: DataFrame with metrics (must have: tid, sid, year, day_number, etc.)

        Returns:
            Number of files written
        """
        if metrics_df.empty:
            self.logger.warning("Empty DataFrame, nothing to write")
            return 0

        # Ensure required columns exist
        required_cols = ['tid', 'sid', 'year', 'day_number', 'time_bucket_no',
                        'metric_name', 'metric_value']
        missing_cols = [col for col in required_cols if col not in metrics_df.columns]
        if missing_cols:
            raise ValueError(f"Missing required columns: {missing_cols}")

        # Add month column if not present
        if 'month' not in metrics_df.columns:
            metrics_df['month'] = pd.to_datetime(
                metrics_df['year'].astype(str) + '-' + metrics_df['day_number'].astype(str),
                format='%Y-%j'
            ).dt.month

        files_written = 0

        # Group by year, month, tid, day for efficient partitioning
        for (year, month, tid, day), group_df in metrics_df.groupby(
            ['year', 'month', 'tid', 'day_number']
        ):
            try:
                file_path = self.get_metrics_file_path(year, month, tid, day)
                file_path.parent.mkdir(parents=True, exist_ok=True)

                # Check if file exists - if so, append/update
                if file_path.exists():
                    existing_df = pd.read_parquet(file_path)

                    # Concatenate with new data
                    combined_df = pd.concat([existing_df, group_df], ignore_index=True)

                    # Remove duplicates (same time bucket + metric)
                    combined_df = combined_df.drop_duplicates(
                        subset=['sid', 'time_bucket_no', 'metric_name'],
                        keep='last'
                    )

                    # Write back
                    combined_df.to_parquet(
                        file_path,
                        compression=self.compression,
                        index=False
                    )
                else:
                    # Write new file
                    group_df.to_parquet(
                        file_path,
                        compression=self.compression,
                        index=False
                    )

                files_written += 1
                self.logger.debug(f"Wrote metrics to {file_path}")

            except Exception as e:
                self.logger.error(f"Error writing metrics for {tid}/{day}: {e}")

        self.logger.info(f"Wrote {files_written} metrics files")
        return files_written

    def read_metrics(
        self,
        tid: str,
        year: Optional[int] = None,
        month: Optional[int] = None,
        day_number: Optional[int] = None,
        sid: Optional[int] = None,
        time_bucket_no: Optional[int] = None,
        metric_names: Optional[List[str]] = None
    ) -> pd.DataFrame:
        """
        Read metrics from Parquet files with flexible filtering

        Args:
            tid: Tenant ID (required)
            year: Filter by year
            month: Filter by month
            day_number: Filter by day
            sid: Filter by sensor ID
            time_bucket_no: Filter by time bucket
            metric_names: Filter by metric names

        Returns:
            DataFrame with metrics
        """
        dfs = []

        # Build search pattern
        if year and month and day_number:
            # Specific day
            pattern = self.metrics_path / f"year={year}" / f"month={month:02d}" / f"tid={tid}" / f"day={day_number:03d}" / "*.parquet"
            files = list(self.metrics_path.glob(str(pattern).replace(str(self.metrics_path) + '/', '')))
        elif year and month:
            # Specific month
            pattern = self.metrics_path / f"year={year}" / f"month={month:02d}" / f"tid={tid}" / "**" / "*.parquet"
            files = list(pattern.parent.glob("**/metrics.parquet"))
        elif year:
            # Specific year
            pattern = self.metrics_path / f"year={year}" / "**" / f"tid={tid}" / "**" / "*.parquet"
            files = list(self.metrics_path.glob(f"year={year}/**/tid={tid}/**/metrics.parquet"))
        else:
            # All data for tenant
            files = list(self.metrics_path.glob(f"**/tid={tid}/**/metrics.parquet"))

        if not files:
            return pd.DataFrame()

        # Read all matching files
        for file_path in files:
            try:
                df = pd.read_parquet(file_path)
                dfs.append(df)
            except Exception as e:
                self.logger.error(f"Error reading {file_path}: {e}")

        if not dfs:
            return pd.DataFrame()

        # Combine all dataframes
        result_df = pd.concat(dfs, ignore_index=True)

        # Apply additional filters
        if sid is not None:
            result_df = result_df[result_df['sid'] == sid]

        if time_bucket_no is not None:
            result_df = result_df[result_df['time_bucket_no'] == time_bucket_no]

        if metric_names:
            result_df = result_df[result_df['metric_name'].isin(metric_names)]

        return result_df

    # ==================== RAW SAMPLES STORAGE ====================

    def write_samples(self, samples_df: pd.DataFrame) -> int:
        """Write raw sensor samples to Parquet"""
        if samples_df.empty:
            return 0

        # Add year/month/day columns
        samples_df['year'] = pd.to_datetime(samples_df['Timestamp']).dt.year
        samples_df['month'] = pd.to_datetime(samples_df['Timestamp']).dt.month
        samples_df['day'] = pd.to_datetime(samples_df['Timestamp']).dt.day

        files_written = 0

        # Group by year/month/tid for partitioning
        for (year, month, tid), group_df in samples_df.groupby(['year', 'month', 'tid']):
            file_path = self.samples_path / f"year={year}" / f"month={month:02d}" / f"tid={tid}" / "samples.parquet"
            file_path.parent.mkdir(parents=True, exist_ok=True)

            # Append or create
            if file_path.exists():
                existing_df = pd.read_parquet(file_path)
                combined_df = pd.concat([existing_df, group_df], ignore_index=True)
                combined_df = combined_df.drop_duplicates(subset=['sid', 'Timestamp'], keep='last')
                combined_df.to_parquet(file_path, compression=self.compression, index=False)
            else:
                group_df.to_parquet(file_path, compression=self.compression, index=False)

            files_written += 1

        return files_written

    def read_samples(
        self,
        tid: str,
        start_time: datetime,
        end_time: datetime,
        sid: Optional[int] = None
    ) -> pd.DataFrame:
        """Read raw samples for a time range"""
        # Search relevant year/month directories
        years = list(range(start_time.year, end_time.year + 1))
        dfs = []

        for year in years:
            for month in range(1, 13):
                file_path = self.samples_path / f"year={year}" / f"month={month:02d}" / f"tid={tid}" / "samples.parquet"
                if file_path.exists():
                    df = pd.read_parquet(file_path)
                    dfs.append(df)

        if not dfs:
            return pd.DataFrame()

        result_df = pd.concat(dfs, ignore_index=True)

        # Filter by time range
        result_df['Timestamp'] = pd.to_datetime(result_df['Timestamp'])
        result_df = result_df[
            (result_df['Timestamp'] >= start_time) &
            (result_df['Timestamp'] <= end_time)
        ]

        if sid is not None:
            result_df = result_df[result_df['sid'] == sid]

        return result_df

    # ==================== SENSOR METADATA STORAGE ====================

    def write_sensors(self, sensors: List[DimSensor]) -> int:
        """Write sensor metadata"""
        df = pd.DataFrame([s.model_dump() for s in sensors])
        file_path = self.sensors_path / "sensors.parquet"
        df.to_parquet(file_path, compression=self.compression, index=False)
        return len(sensors)

    def read_sensors(self, tid: Optional[str] = None) -> List[DimSensor]:
        """Read sensor metadata"""
        file_path = self.sensors_path / "sensors.parquet"
        if not file_path.exists():
            return []

        df = pd.read_parquet(file_path)

        if tid:
            df = df[df['tid'] == tid]

        return [DimSensor(**row) for row in df.to_dict('records')]

    # ==================== COMPUTATION LOGS ====================

    def write_computation_log(self, log: ComputationLog) -> bool:
        """Write computation log entry"""
        try:
            log_df = pd.DataFrame([log.model_dump()])

            # Partition by year/month
            file_path = self.logs_path / f"year={log.year}" / f"month={(log.day_number - 1) // 30 + 1:02d}" / "computation_logs.parquet"
            file_path.parent.mkdir(parents=True, exist_ok=True)

            if file_path.exists():
                existing_df = pd.read_parquet(file_path)
                combined_df = pd.concat([existing_df, log_df], ignore_index=True)
                combined_df.to_parquet(file_path, compression=self.compression, index=False)
            else:
                log_df.to_parquet(file_path, compression=self.compression, index=False)

            return True
        except Exception as e:
            self.logger.error(f"Error writing computation log: {e}")
            return False

    def read_computation_logs(
        self,
        year: Optional[int] = None,
        status: Optional[str] = None,
        limit: int = 100
    ) -> List[ComputationLog]:
        """Read computation logs"""
        dfs = []

        if year:
            pattern = self.logs_path / f"year={year}" / "**" / "computation_logs.parquet"
            files = list(self.logs_path.glob(f"year={year}/**/computation_logs.parquet"))
        else:
            files = list(self.logs_path.glob("**/computation_logs.parquet"))

        for file_path in files:
            df = pd.read_parquet(file_path)
            dfs.append(df)

        if not dfs:
            return []

        result_df = pd.concat(dfs, ignore_index=True)

        if status:
            result_df = result_df[result_df['status'] == status]

        # Sort by started_at descending
        result_df = result_df.sort_values('started_at', ascending=False).head(limit)

        return [ComputationLog(**row) for row in result_df.to_dict('records')]

    # ==================== ML MODEL VERSIONING ====================

    def write_ml_model(self, model_version: MLModelVersion, model_file_path: Optional[Path] = None) -> bool:
        """Write ML model version metadata and optionally the model file"""
        try:
            # Write metadata
            metadata_df = pd.DataFrame([model_version.model_dump()])
            metadata_file = self.ml_models_path / f"{model_version.model_type}_versions.parquet"

            if metadata_file.exists():
                existing_df = pd.read_parquet(metadata_file)
                combined_df = pd.concat([existing_df, metadata_df], ignore_index=True)
                combined_df.to_parquet(metadata_file, compression=self.compression, index=False)
            else:
                metadata_df.to_parquet(metadata_file, compression=self.compression, index=False)

            # Copy model file if provided
            if model_file_path and model_file_path.exists():
                dest_path = self.ml_models_path / f"{model_version.model_type}_{model_version.version}.pkl"
                import shutil
                shutil.copy(model_file_path, dest_path)

            return True
        except Exception as e:
            self.logger.error(f"Error writing ML model: {e}")
            return False

    def read_ml_model_versions(
        self,
        model_type: str,
        active_only: bool = True
    ) -> List[MLModelVersion]:
        """Read ML model versions"""
        metadata_file = self.ml_models_path / f"{model_type}_versions.parquet"

        if not metadata_file.exists():
            return []

        df = pd.read_parquet(metadata_file)

        if active_only:
            df = df[df['is_active'] == True]

        return [MLModelVersion(**row) for row in df.to_dict('records')]

    def get_ml_model_path(self, model_type: str, version: str) -> Optional[Path]:
        """Get path to ML model file"""
        model_path = self.ml_models_path / f"{model_type}_{version}.pkl"
        return model_path if model_path.exists() else None

    # ==================== TENANT CONFIGURATION ====================

    def write_tenant_config(self, tenant_config: TenantConfig) -> bool:
        """Write tenant configuration"""
        try:
            config_df = pd.DataFrame([tenant_config.model_dump()])
            file_path = self.config_path / "tenant_configs.parquet"

            if file_path.exists():
                existing_df = pd.read_parquet(file_path)
                # Remove old config for this tenant
                existing_df = existing_df[existing_df['tid'] != tenant_config.tid]
                combined_df = pd.concat([existing_df, config_df], ignore_index=True)
                combined_df.to_parquet(file_path, compression=self.compression, index=False)
            else:
                config_df.to_parquet(file_path, compression=self.compression, index=False)

            return True
        except Exception as e:
            self.logger.error(f"Error writing tenant config: {e}")
            return False

    def read_tenant_configs(self, tid: Optional[str] = None) -> List[TenantConfig]:
        """Read tenant configurations"""
        file_path = self.config_path / "tenant_configs.parquet"

        if not file_path.exists():
            return []

        df = pd.read_parquet(file_path)

        if tid:
            df = df[df['tid'] == tid]

        return [TenantConfig(**row) for row in df.to_dict('records')]

    # ==================== UTILITY METHODS ====================

    def get_storage_stats(self) -> Dict[str, Any]:
        """Get storage statistics"""
        stats = {
            'total_size_bytes': 0,
            'metrics_size_bytes': 0,
            'samples_size_bytes': 0,
            'file_counts': {
                'metrics': 0,
                'samples': 0,
                'logs': 0,
                'ml_models': 0,
                'configs': 0
            }
        }

        # Calculate sizes
        for path, key in [
            (self.metrics_path, 'metrics'),
            (self.samples_path, 'samples'),
            (self.logs_path, 'logs'),
            (self.ml_models_path, 'ml_models'),
            (self.config_path, 'configs')
        ]:
            if path.exists():
                for file_path in path.rglob("*.parquet"):
                    size = file_path.stat().st_size
                    stats['total_size_bytes'] += size
                    if key in ['metrics', 'samples']:
                        stats[f'{key}_size_bytes'] = stats.get(f'{key}_size_bytes', 0) + size
                    stats['file_counts'][key] += 1

        return stats

    def cleanup_old_data(self, retention_days: int = 90) -> int:
        """Delete data older than retention period"""
        from datetime import timedelta

        cutoff_date = datetime.utcnow() - timedelta(days=retention_days)
        deleted_count = 0

        # Clean up metrics
        for year_dir in self.metrics_path.glob("year=*"):
            year = int(year_dir.name.split('=')[1])
            if year < cutoff_date.year - 1:  # Keep at least last year
                import shutil
                shutil.rmtree(year_dir)
                deleted_count += 1

        self.logger.info(f"Cleaned up {deleted_count} old directories")
        return deleted_count
