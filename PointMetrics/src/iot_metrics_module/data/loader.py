"""Data loader for fetching raw IoT samples from source database"""

from datetime import datetime
from typing import List, Optional, Tuple, Dict, Any
import pandas as pd
from sqlalchemy import create_engine, and_, or_
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import QueuePool

from ..config.config import Config
from ..utils.logger import get_context_logger
from ..utils.helpers import get_bucket_datetime_range, validate_dataframe_columns
from .models import DimSensor, FactSample


class DataLoader:
    """
    DataLoader class for fetching raw sensor data from source database
    """

    def __init__(self, config: Config):
        """
        Initialize DataLoader with configuration

        Args:
            config: Configuration object
        """
        self.config = config
        self.logger = get_context_logger('data.loader')

        # Create database engine with connection pooling
        self.engine = create_engine(
            config.database.connection_string,
            poolclass=QueuePool,
            pool_size=config.database.pool_size,
            max_overflow=config.database.max_overflow,
            pool_pre_ping=True,  # Test connections before using
            pool_recycle=3600,  # Recycle connections after 1 hour
            echo=config.debug
        )

        # Create session factory
        self.SessionLocal = sessionmaker(
            autocommit=False,
            autoflush=False,
            bind=self.engine
        )

        self.logger.info("DataLoader initialized")

    def get_session(self) -> Session:
        """
        Get a new database session

        Returns:
            SQLAlchemy session
        """
        return self.SessionLocal()

    def fetch_sensors(
        self,
        tid: Optional[str] = None,
        sid: Optional[int] = None,
        sids: Optional[List[int]] = None
    ) -> pd.DataFrame:
        """
        Fetch sensor metadata from DimSensor table

        Args:
            tid: Tenant ID filter (optional)
            sid: Single sensor ID filter (optional)
            sids: Multiple sensor IDs filter (optional)

        Returns:
            DataFrame with sensor metadata
        """
        session = self.get_session()
        try:
            query = session.query(DimSensor)

            # Apply filters
            if tid:
                query = query.filter(DimSensor.tid == tid)
            if sid:
                query = query.filter(DimSensor.sid == sid)
            if sids:
                query = query.filter(DimSensor.sid.in_(sids))

            # Execute query
            sensors = query.all()

            # Convert to DataFrame
            if not sensors:
                return pd.DataFrame()

            data = [{
                'sid': s.sid,
                'tid': s.tid,
                'ObjectInstance': s.ObjectInstance,
                'ObjectType': s.ObjectType,
                'ObjectName': s.ObjectName,
                'ObjectDescription': s.ObjectDescription,
                'ObjectStatus': s.ObjectStatus,
                'expected_daily_count': s.expected_daily_count or self.config.tenant.default_expected_daily_count
            } for s in sensors]

            df = pd.DataFrame(data)
            self.logger.info(f"Fetched {len(df)} sensors")
            return df

        except Exception as e:
            self.logger.error(f"Error fetching sensors: {e}")
            raise
        finally:
            session.close()

    def fetch_samples_by_time_range(
        self,
        start_time: datetime,
        end_time: datetime,
        tid: Optional[str] = None,
        sid: Optional[int] = None,
        sids: Optional[List[int]] = None
    ) -> pd.DataFrame:
        """
        Fetch raw samples for a time range

        Args:
            start_time: Start of time window
            end_time: End of time window
            tid: Tenant ID filter (optional)
            sid: Single sensor ID filter (optional)
            sids: Multiple sensor IDs filter (optional)

        Returns:
            DataFrame with raw samples
        """
        session = self.get_session()
        try:
            query = session.query(FactSample)

            # Time range filter
            query = query.filter(
                and_(
                    FactSample.Timestamp >= start_time,
                    FactSample.Timestamp < end_time
                )
            )

            # Apply additional filters
            if tid:
                query = query.filter(FactSample.tid == tid)
            if sid:
                query = query.filter(FactSample.sid == sid)
            if sids:
                query = query.filter(FactSample.sid.in_(sids))

            # Order by timestamp
            query = query.order_by(FactSample.Timestamp)

            # Execute query
            samples = query.all()

            # Convert to DataFrame
            if not samples:
                self.logger.warning(f"No samples found for time range {start_time} to {end_time}")
                return pd.DataFrame()

            data = [{
                'sample_id': s.sample_id,
                'sid': s.sid,
                'tid': s.tid,
                'Timestamp': s.Timestamp,
                'PresentValue': s.PresentValue
            } for s in samples]

            df = pd.DataFrame(data)
            self.logger.info(f"Fetched {len(df)} samples from {start_time} to {end_time}")
            return df

        except Exception as e:
            self.logger.error(f"Error fetching samples: {e}")
            raise
        finally:
            session.close()

    def fetch_samples_by_bucket(
        self,
        year: int,
        day_number: int,
        time_bucket_no: int,
        tid: Optional[str] = None,
        sid: Optional[int] = None,
        sids: Optional[List[int]] = None
    ) -> pd.DataFrame:
        """
        Fetch raw samples for a specific time bucket

        Args:
            year: Year
            day_number: Day of year (1-366)
            time_bucket_no: Bucket number within day
            tid: Tenant ID filter (optional)
            sid: Single sensor ID filter (optional)
            sids: Multiple sensor IDs filter (optional)

        Returns:
            DataFrame with raw samples
        """
        # Convert bucket coordinates to datetime range
        start_time, end_time = get_bucket_datetime_range(
            year, day_number, time_bucket_no,
            self.config.metrics.bucket_interval_minutes
        )

        self.logger.debug(
            f"Fetching samples for bucket: year={year}, day={day_number}, "
            f"bucket={time_bucket_no} ({start_time} to {end_time})"
        )

        return self.fetch_samples_by_time_range(
            start_time, end_time, tid, sid, sids
        )

    def fetch_samples_by_buckets(
        self,
        bucket_coords: List[Tuple[int, int, int]],
        tid: Optional[str] = None,
        sid: Optional[int] = None,
        sids: Optional[List[int]] = None
    ) -> pd.DataFrame:
        """
        Fetch raw samples for multiple time buckets

        Args:
            bucket_coords: List of (year, day_number, time_bucket_no) tuples
            tid: Tenant ID filter (optional)
            sid: Single sensor ID filter (optional)
            sids: Multiple sensor IDs filter (optional)

        Returns:
            DataFrame with raw samples from all buckets
        """
        all_samples = []

        for year, day_number, time_bucket_no in bucket_coords:
            df = self.fetch_samples_by_bucket(
                year, day_number, time_bucket_no,
                tid, sid, sids
            )
            if not df.empty:
                all_samples.append(df)

        if not all_samples:
            return pd.DataFrame()

        # Concatenate all samples
        combined_df = pd.concat(all_samples, ignore_index=True)
        self.logger.info(f"Fetched {len(combined_df)} samples from {len(bucket_coords)} buckets")

        return combined_df

    def get_sensor_info(self, sid: int) -> Optional[Dict[str, Any]]:
        """
        Get metadata for a single sensor

        Args:
            sid: Sensor ID

        Returns:
            Dictionary with sensor metadata or None if not found
        """
        df = self.fetch_sensors(sid=sid)
        if df.empty:
            return None
        return df.iloc[0].to_dict()

    def get_active_sensors_for_tenant(self, tid: str) -> List[int]:
        """
        Get list of active sensor IDs for a tenant

        Args:
            tid: Tenant ID

        Returns:
            List of sensor IDs
        """
        df = self.fetch_sensors(tid=tid)
        if df.empty:
            return []
        return df['sid'].tolist()

    def get_sensor_expected_count(self, sid: int) -> int:
        """
        Get expected daily sample count for a sensor

        Args:
            sid: Sensor ID

        Returns:
            Expected daily count
        """
        sensor_info = self.get_sensor_info(sid)
        if sensor_info is None:
            return self.config.tenant.default_expected_daily_count
        return sensor_info.get('expected_daily_count', self.config.tenant.default_expected_daily_count)

    def fetch_and_group_by_sensor(
        self,
        year: int,
        day_number: int,
        time_bucket_no: int,
        tid: Optional[str] = None,
        sids: Optional[List[int]] = None
    ) -> Dict[int, pd.DataFrame]:
        """
        Fetch samples and group by sensor ID

        Args:
            year: Year
            day_number: Day of year
            time_bucket_no: Bucket number
            tid: Tenant ID filter (optional)
            sids: Sensor IDs filter (optional)

        Returns:
            Dictionary mapping sid to DataFrame of samples
        """
        # Fetch all samples for the bucket
        df = self.fetch_samples_by_bucket(
            year, day_number, time_bucket_no,
            tid=tid, sids=sids
        )

        if df.empty:
            return {}

        # Group by sensor ID
        grouped = {}
        for sid, group_df in df.groupby('sid'):
            grouped[sid] = group_df.reset_index(drop=True)

        self.logger.info(f"Grouped {len(df)} samples into {len(grouped)} sensors")
        return grouped

    def test_connection(self) -> bool:
        """
        Test database connection

        Returns:
            True if connection successful
        """
        try:
            session = self.get_session()
            session.execute("SELECT 1")
            session.close()
            self.logger.info("Database connection test successful")
            return True
        except Exception as e:
            self.logger.error(f"Database connection test failed: {e}")
            return False

    def get_database_stats(self) -> Dict[str, Any]:
        """
        Get statistics about the source database

        Returns:
            Dictionary with database statistics
        """
        session = self.get_session()
        try:
            # Count sensors
            sensor_count = session.query(DimSensor).count()

            # Count samples (limit to avoid long query)
            sample_count = session.query(FactSample).count()

            # Get date range of samples
            from sqlalchemy import func
            date_range = session.query(
                func.min(FactSample.Timestamp),
                func.max(FactSample.Timestamp)
            ).first()

            stats = {
                'sensor_count': sensor_count,
                'sample_count': sample_count,
                'earliest_sample': date_range[0],
                'latest_sample': date_range[1]
            }

            self.logger.info(f"Database stats: {stats}")
            return stats

        except Exception as e:
            self.logger.error(f"Error getting database stats: {e}")
            raise
        finally:
            session.close()

    def close(self):
        """Close database connections"""
        self.engine.dispose()
        self.logger.info("DataLoader connections closed")
