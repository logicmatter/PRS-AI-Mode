"""Data loader for IoT metrics module (Parquet-based)"""

from typing import Optional, List
from datetime import datetime, timedelta
from pathlib import Path
import pandas as pd

from ..config.config import Config
from ..utils.logger import get_context_logger
from ..storage.parquet_adapter import ParquetStorageAdapter
from .models import DimSensor, FactSample, timestamp_to_bucket


class DataLoader:
    """
    Data loader for fetching raw IoT sensor data
    Works with Parquet files for storage
    """

    def __init__(self, config: Config):
        """
        Initialize data loader

        Args:
            config: Configuration object
        """
        self.config = config
        self.logger = get_context_logger('data.loader')
        self.storage = ParquetStorageAdapter(config)

        self.logger.info("DataLoader initialized with Parquet storage")

    def load_sensors(self, tid: Optional[str] = None) -> List[DimSensor]:
        """
        Load sensor metadata

        Args:
            tid: Optional tenant ID filter

        Returns:
            List of DimSensor objects
        """
        sensors = self.storage.read_sensors(tid=tid)
        self.logger.debug(f"Loaded {len(sensors)} sensors" + (f" for tenant {tid}" if tid else ""))
        return sensors

    def load_sensor_by_id(self, sid: int) -> Optional[DimSensor]:
        """
        Load a single sensor by ID

        Args:
            sid: Sensor ID

        Returns:
            DimSensor object or None
        """
        all_sensors = self.storage.read_sensors()
        for sensor in all_sensors:
            if sensor.sid == sid:
                return sensor
        return None

    def load_samples_for_bucket(
        self,
        year: int,
        day_number: int,
        time_bucket_no: int,
        tid: Optional[str] = None,
        sids: Optional[List[int]] = None
    ) -> pd.DataFrame:
        """
        Load raw samples for a specific time bucket

        Args:
            year: Year
            day_number: Day of year
            time_bucket_no: Time bucket number
            tid: Optional tenant ID filter
            sids: Optional sensor ID list filter

        Returns:
            DataFrame with raw samples
        """
        # Calculate time range for the bucket
        bucket_minutes = self.config.metrics.bucket_interval_minutes

        # Create base datetime from year and day_number
        base_date = datetime(year, 1, 1) + timedelta(days=day_number - 1)

        # Add bucket offset
        bucket_offset = timedelta(minutes=time_bucket_no * bucket_minutes)
        start_time = base_date + bucket_offset
        end_time = start_time + timedelta(minutes=bucket_minutes)

        self.logger.debug(
            f"Loading samples for bucket {year}-{day_number}-{time_bucket_no} "
            f"({start_time} to {end_time})"
        )

        # If tid is provided, load from storage
        if tid:
            samples_df = self.storage.read_samples(
                tid=tid,
                start_time=start_time,
                end_time=end_time
            )
        else:
            # Load all tenants (iterate through all tenant configs)
            tenant_configs = self.storage.read_tenant_configs()
            dfs = []
            for config in tenant_configs:
                if config.enabled:
                    df = self.storage.read_samples(
                        tid=config.tid,
                        start_time=start_time,
                        end_time=end_time
                    )
                    dfs.append(df)

            samples_df = pd.concat(dfs, ignore_index=True) if dfs else pd.DataFrame()

        # Filter by sensor IDs if provided
        if sids and not samples_df.empty:
            samples_df = samples_df[samples_df['sid'].isin(sids)]

        self.logger.info(f"Loaded {len(samples_df)} samples for bucket")
        return samples_df

    def load_samples_for_time_range(
        self,
        start_time: datetime,
        end_time: datetime,
        tid: Optional[str] = None,
        sid: Optional[int] = None
    ) -> pd.DataFrame:
        """
        Load raw samples for a time range

        Args:
            start_time: Start timestamp
            end_time: End timestamp
            tid: Optional tenant ID filter
            sid: Optional sensor ID filter

        Returns:
            DataFrame with raw samples
        """
        if tid:
            samples_df = self.storage.read_samples(
                tid=tid,
                start_time=start_time,
                end_time=end_time,
                sid=sid
            )
        else:
            # Load all tenants
            tenant_configs = self.storage.read_tenant_configs()
            dfs = []
            for config in tenant_configs:
                if config.enabled:
                    df = self.storage.read_samples(
                        tid=config.tid,
                        start_time=start_time,
                        end_time=end_time,
                        sid=sid
                    )
                    dfs.append(df)

            samples_df = pd.concat(dfs, ignore_index=True) if dfs else pd.DataFrame()

        self.logger.info(
            f"Loaded {len(samples_df)} samples for time range "
            f"{start_time} to {end_time}"
        )
        return samples_df

    def get_expected_sample_count(self, sid: int) -> int:
        """
        Get expected sample count for a sensor within a bucket

        Args:
            sid: Sensor ID

        Returns:
            Expected sample count
        """
        sensor = self.load_sensor_by_id(sid)

        if sensor and sensor.expected_daily_count:
            # Calculate expected count for bucket size
            bucket_minutes = self.config.metrics.bucket_interval_minutes
            minutes_per_day = 1440
            return int(
                (sensor.expected_daily_count * bucket_minutes) / minutes_per_day
            )

        # Default fallback
        return int(bucket_minutes)  # Assume 1 sample per minute

    def test_connection(self) -> bool:
        """
        Test that storage is accessible

        Returns:
            True if storage is accessible
        """
        try:
            stats = self.storage.get_storage_stats()
            self.logger.info(f"Storage test successful: {stats}")
            return True
        except Exception as e:
            self.logger.error(f"Storage test failed: {e}")
            return False

    def close(self):
        """Close any open connections (no-op for Parquet storage)"""
        self.logger.info("DataLoader closed")


class SyntheticDataGenerator:
    """
    Utility class for generating synthetic IoT sensor data for testing
    """

    def __init__(self, storage: ParquetStorageAdapter):
        """
        Initialize synthetic data generator

        Args:
            storage: Storage adapter to write data to
        """
        self.storage = storage
        self.logger = get_context_logger('data.synthetic')

    def generate_sensors(
        self,
        tid: str,
        num_sensors: int = 10,
        sensor_type: str = "AnalogInput"
    ) -> List[DimSensor]:
        """
        Generate synthetic sensor metadata

        Args:
            tid: Tenant ID
            num_sensors: Number of sensors to generate
            sensor_type: Type of sensors

        Returns:
            List of generated sensors
        """
        import random

        sensors = []
        for i in range(num_sensors):
            sensor = DimSensor(
                sid=1000 + i,
                tid=tid,
                ObjectInstance=f"{sensor_type}:{i+1}",
                ObjectType=sensor_type,
                ObjectName=f"Sensor {i+1}",
                ObjectDescription=f"Test sensor {i+1} for tenant {tid}",
                ObjectStatus="Active",
                expected_daily_count=1440,  # 1 sample per minute
                created_at=datetime.utcnow()
            )
            sensors.append(sensor)

        # Write to storage
        self.storage.write_sensors(sensors)
        self.logger.info(f"Generated {num_sensors} synthetic sensors for {tid}")

        return sensors

    def generate_samples(
        self,
        sensors: List[DimSensor],
        start_time: datetime,
        end_time: datetime,
        sample_interval_minutes: int = 1,
        value_range: tuple = (65.0, 85.0),
        add_noise: bool = True
    ) -> pd.DataFrame:
        """
        Generate synthetic sample data

        Args:
            sensors: List of sensors to generate data for
            start_time: Start timestamp
            end_time: End timestamp
            sample_interval_minutes: Minutes between samples
            value_range: (min, max) range for values
            add_noise: Whether to add random noise

        Returns:
            DataFrame with generated samples
        """
        import random
        import numpy as np

        samples = []
        sample_id = 1

        for sensor in sensors:
            current_time = start_time
            base_value = random.uniform(value_range[0], value_range[1])

            while current_time <= end_time:
                # Add some variation
                if add_noise:
                    value = base_value + np.random.normal(0, 2.0)
                    value = max(value_range[0], min(value_range[1], value))
                else:
                    value = base_value

                sample = {
                    'sample_id': sample_id,
                    'sid': sensor.sid,
                    'tid': sensor.tid,
                    'Timestamp': current_time,
                    'PresentValue': round(value, 2),
                    'created_at': datetime.utcnow()
                }
                samples.append(sample)

                sample_id += 1
                current_time += timedelta(minutes=sample_interval_minutes)

        samples_df = pd.DataFrame(samples)

        # Write to storage
        self.storage.write_samples(samples_df)

        self.logger.info(
            f"Generated {len(samples_df)} synthetic samples for "
            f"{len(sensors)} sensors from {start_time} to {end_time}"
        )

        return samples_df

    def generate_complete_dataset(
        self,
        tid: str,
        num_sensors: int = 10,
        days: int = 1,
        sample_interval_minutes: int = 1
    ) -> tuple[List[DimSensor], pd.DataFrame]:
        """
        Generate a complete synthetic dataset (sensors + samples)

        Args:
            tid: Tenant ID
            num_sensors: Number of sensors
            days: Number of days of data
            sample_interval_minutes: Minutes between samples

        Returns:
            Tuple of (sensors list, samples dataframe)
        """
        # Generate sensors
        sensors = self.generate_sensors(tid, num_sensors)

        # Generate samples for the time range
        end_time = datetime.utcnow()
        start_time = end_time - timedelta(days=days)

        samples_df = self.generate_samples(
            sensors,
            start_time,
            end_time,
            sample_interval_minutes
        )

        return sensors, samples_df
