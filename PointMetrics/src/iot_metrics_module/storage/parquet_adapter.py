"""Parquet storage adapter for long-term archival"""

from typing import Optional
from pathlib import Path
from datetime import datetime
import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq

from ..config.config import Config
from ..utils.logger import get_context_logger


class ParquetAdapter:
    """
    Storage adapter for Parquet files (cold storage / archive)
    """

    def __init__(self, config: Config):
        """
        Initialize Parquet adapter

        Args:
            config: Configuration object
        """
        self.config = config
        self.logger = get_context_logger('storage.parquet')

        self.base_path = Path(config.storage.parquet_base_path)
        self.compression = config.storage.parquet_compression

        # Create base directory
        if config.storage.enable_parquet_archive:
            self.base_path.mkdir(parents=True, exist_ok=True)

        self.logger.info(f"ParquetAdapter initialized at {self.base_path}")

    def get_file_path(
        self,
        year: int,
        month: int,
        tid: str,
        sid: int
    ) -> Path:
        """
        Get Parquet file path for given coordinates

        Args:
            year: Year
            month: Month
            tid: Tenant ID
            sid: Sensor ID

        Returns:
            Path object
        """
        # Structure: year=YYYY/month=MM/tid=XXX/sid=NNN.parquet
        file_path = (
            self.base_path /
            f"year={year}" /
            f"month={month:02d}" /
            f"tid={tid}" /
            f"{sid}.parquet"
        )
        return file_path

    def write_metrics(
        self,
        metrics_df: pd.DataFrame
    ) -> int:
        """
        Write metrics to Parquet files partitioned by year/month/tid/sid

        Args:
            metrics_df: DataFrame with metrics

        Returns:
            Number of files written
        """
        if metrics_df.empty:
            self.logger.warning("Empty DataFrame, nothing to write")
            return 0

        # Add year/month columns if not present
        if 'year' in metrics_df.columns and 'month' not in metrics_df.columns:
            # Reconstruct month from year and day_number
            metrics_df['month'] = pd.to_datetime(
                metrics_df['year'].astype(str) + '-' + metrics_df['day_number'].astype(str),
                format='%Y-%j'
            ).dt.month

        files_written = 0

        # Group by year, month, tid, sid
        for (year, month, tid, sid), group_df in metrics_df.groupby(
            ['year', 'month', 'tid', 'sid']
        ):
            try:
                file_path = self.get_file_path(year, month, tid, sid)
                file_path.parent.mkdir(parents=True, exist_ok=True)

                # Check if file exists - if so, append
                if file_path.exists():
                    # Read existing file
                    existing_df = pd.read_parquet(file_path)

                    # Concatenate with new data
                    combined_df = pd.concat([existing_df, group_df], ignore_index=True)

                    # Remove duplicates (same time bucket)
                    combined_df = combined_df.drop_duplicates(
                        subset=['year', 'day_number', 'time_bucket_no', 'metric_name'],
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
                self.logger.error(f"Error writing parquet file for {tid}/{sid}: {e}")

        self.logger.info(f"Wrote {files_written} Parquet files")
        return files_written

    def read_metrics(
        self,
        year: int,
        month: int,
        tid: str,
        sid: Optional[int] = None
    ) -> pd.DataFrame:
        """
        Read metrics from Parquet files

        Args:
            year: Year
            month: Month
            tid: Tenant ID
            sid: Sensor ID (optional, if None read all sensors for tenant)

        Returns:
            DataFrame with metrics
        """
        if sid is not None:
            # Read single file
            file_path = self.get_file_path(year, month, tid, sid)
            if file_path.exists():
                return pd.read_parquet(file_path)
            else:
                return pd.DataFrame()
        else:
            # Read all files for tenant in given year/month
            tenant_path = (
                self.base_path /
                f"year={year}" /
                f"month={month:02d}" /
                f"tid={tid}"
            )

            if not tenant_path.exists():
                return pd.DataFrame()

            # Read all parquet files in directory
            dfs = []
            for file_path in tenant_path.glob("*.parquet"):
                df = pd.read_parquet(file_path)
                dfs.append(df)

            if not dfs:
                return pd.DataFrame()

            return pd.concat(dfs, ignore_index=True)

    def get_storage_size(self, tid: Optional[str] = None) -> int:
        """
        Get total storage size in bytes

        Args:
            tid: Tenant ID (optional, if None get total size)

        Returns:
            Size in bytes
        """
        total_size = 0

        if tid:
            # Size for specific tenant
            for year_dir in self.base_path.glob("year=*"):
                for month_dir in year_dir.glob("month=*"):
                    tenant_dir = month_dir / f"tid={tid}"
                    if tenant_dir.exists():
                        for file_path in tenant_dir.glob("*.parquet"):
                            total_size += file_path.stat().st_size
        else:
            # Total size
            for file_path in self.base_path.rglob("*.parquet"):
                total_size += file_path.stat().st_size

        return total_size
