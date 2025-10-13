"""PostgreSQL storage adapter for metrics"""

from typing import Dict, List, Optional, Any
from datetime import datetime
import pandas as pd
from sqlalchemy import create_engine, and_, or_
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.pool import QueuePool

from ..config.config import Config
from ..data.models import MetricsDim, MetricsFact, ComputationLog, Base
from ..utils.logger import get_context_logger


class PostgreSQLAdapter:
    """
    Storage adapter for PostgreSQL database
    Handles writing computed metrics to MetricsDim and MetricsFact tables
    """

    def __init__(self, config: Config):
        """
        Initialize PostgreSQL adapter

        Args:
            config: Configuration object
        """
        self.config = config
        self.logger = get_context_logger('storage.postgres')

        # Create database engine
        self.engine = create_engine(
            config.database.connection_string,
            poolclass=QueuePool,
            pool_size=config.database.pool_size,
            max_overflow=config.database.max_overflow,
            pool_pre_ping=True,
            pool_recycle=3600,
            echo=config.debug
        )

        # Create session factory
        self.SessionLocal = sessionmaker(
            autocommit=False,
            autoflush=False,
            bind=self.engine
        )

        self.logger.info("PostgreSQLAdapter initialized")

    def get_session(self) -> Session:
        """Get a new database session"""
        return self.SessionLocal()

    def create_tables(self):
        """Create all metrics tables"""
        Base.metadata.create_all(self.engine)
        self.logger.info("Metrics tables created")

    def upsert_metrics_dim(
        self,
        metrics_df: pd.DataFrame
    ) -> Dict[str, int]:
        """
        Upsert metric definitions into MetricsDim table

        Args:
            metrics_df: DataFrame with metric definitions

        Returns:
            Dictionary mapping metric keys to metric_ids
        """
        session = self.get_session()
        metric_id_map = {}

        try:
            # Get unique metric definitions
            unique_metrics = metrics_df[[
                'tid', 'sid', 'metric_name', 'metric_category', 'unit', 'description'
            ]].drop_duplicates()

            for _, row in unique_metrics.iterrows():
                tid = row['tid']
                sid = row['sid']
                metric_name = row['metric_name']

                # Check if metric exists
                existing = session.query(MetricsDim).filter(
                    and_(
                        MetricsDim.tid == tid,
                        MetricsDim.sid == sid,
                        MetricsDim.metric_name == metric_name
                    )
                ).first()

                if existing:
                    metric_id = existing.metric_id
                else:
                    # Insert new metric
                    new_metric = MetricsDim(
                        tid=tid,
                        sid=sid,
                        metric_name=metric_name,
                        metric_category=row['metric_category'],
                        unit=row['unit'],
                        description=row['description']
                    )
                    session.add(new_metric)
                    session.flush()
                    metric_id = new_metric.metric_id

                # Store mapping
                key = f"{tid}_{sid}_{metric_name}"
                metric_id_map[key] = metric_id

            session.commit()
            self.logger.info(f"Upserted {len(metric_id_map)} metric definitions")

            return metric_id_map

        except Exception as e:
            session.rollback()
            self.logger.error(f"Error upserting metrics dim: {e}")
            raise
        finally:
            session.close()

    def insert_metrics_fact(
        self,
        metrics_df: pd.DataFrame,
        metric_id_map: Dict[str, int]
    ) -> int:
        """
        Insert computed metrics into MetricsFact table

        Args:
            metrics_df: DataFrame with computed metrics
            metric_id_map: Mapping of metric keys to metric_ids

        Returns:
            Number of rows inserted
        """
        session = self.get_session()

        try:
            # Add metric_id to dataframe
            metrics_df = metrics_df.copy()
            metrics_df['metric_key'] = (
                metrics_df['tid'].astype(str) + '_' +
                metrics_df['sid'].astype(str) + '_' +
                metrics_df['metric_name'].astype(str)
            )
            metrics_df['metric_id'] = metrics_df['metric_key'].map(metric_id_map)

            # Filter out rows without metric_id
            valid_df = metrics_df[metrics_df['metric_id'].notna()].copy()

            if valid_df.empty:
                self.logger.warning("No valid metrics to insert")
                return 0

            # Prepare records for insertion
            records = []
            for _, row in valid_df.iterrows():
                record = {
                    'tid': row['tid'],
                    'sid': row['sid'],
                    'metric_id': int(row['metric_id']),
                    'YearNumber': int(row['year']),
                    'DayNumber': int(row['day_number']),
                    'TimeBucketNo': int(row['time_bucket_no']),
                    'metric_value': float(row['metric_value']) if pd.notna(row['metric_value']) else None,
                    'computed_at': datetime.utcnow()
                }
                records.append(record)

            # Batch insert using PostgreSQL UPSERT (ON CONFLICT)
            if records:
                stmt = insert(MetricsFact).values(records)
                stmt = stmt.on_conflict_do_update(
                    constraint='uq_metrics_fact_unique_bucket',
                    set_={
                        'metric_value': stmt.excluded.metric_value,
                        'computed_at': stmt.excluded.computed_at
                    }
                )
                session.execute(stmt)
                session.commit()

            self.logger.info(f"Inserted/updated {len(records)} metric facts")
            return len(records)

        except Exception as e:
            session.rollback()
            self.logger.error(f"Error inserting metrics fact: {e}")
            raise
        finally:
            session.close()

    def store_metrics(
        self,
        metrics_df: pd.DataFrame
    ) -> Dict[str, int]:
        """
        Store computed metrics (convenience method)

        Args:
            metrics_df: DataFrame with computed metrics

        Returns:
            Dictionary with storage statistics
        """
        if metrics_df.empty:
            self.logger.warning("Empty metrics DataFrame, nothing to store")
            return {'dim_count': 0, 'fact_count': 0}

        # Upsert metric definitions
        metric_id_map = self.upsert_metrics_dim(metrics_df)

        # Insert metric values
        fact_count = self.insert_metrics_fact(metrics_df, metric_id_map)

        return {
            'dim_count': len(metric_id_map),
            'fact_count': fact_count
        }

    def log_computation(
        self,
        execution_type: str,
        year: int,
        day_number: int,
        time_bucket_no: int,
        started_at: datetime,
        completed_at: datetime,
        sensors_processed: int,
        metrics_computed: int,
        status: str,
        error_message: Optional[str] = None,
        triggered_by: Optional[str] = None
    ) -> int:
        """
        Log computation execution

        Args:
            execution_type: Type of execution (scheduled, on-demand)
            year: Year
            day_number: Day of year
            time_bucket_no: Time bucket number
            started_at: Start time
            completed_at: Completion time
            sensors_processed: Number of sensors processed
            metrics_computed: Number of metrics computed
            status: Execution status (success, failed, partial)
            error_message: Error message if failed
            triggered_by: Who triggered the execution

        Returns:
            Log ID
        """
        session = self.get_session()

        try:
            duration = (completed_at - started_at).total_seconds()

            log_entry = ComputationLog(
                execution_type=execution_type,
                YearNumber=year,
                DayNumber=day_number,
                TimeBucketNo=time_bucket_no,
                started_at=started_at,
                completed_at=completed_at,
                duration_seconds=duration,
                sensors_processed=sensors_processed,
                metrics_computed=metrics_computed,
                status=status,
                error_message=error_message,
                triggered_by=triggered_by
            )

            session.add(log_entry)
            session.commit()

            log_id = log_entry.log_id
            self.logger.info(f"Logged computation: {log_id}, status={status}, duration={duration:.2f}s")

            return log_id

        except Exception as e:
            session.rollback()
            self.logger.error(f"Error logging computation: {e}")
            raise
        finally:
            session.close()

    def query_metrics(
        self,
        tid: Optional[str] = None,
        sid: Optional[int] = None,
        metric_names: Optional[List[str]] = None,
        year: Optional[int] = None,
        day_number: Optional[int] = None,
        time_bucket_no: Optional[int] = None,
        limit: Optional[int] = None
    ) -> pd.DataFrame:
        """
        Query metrics from MetricsFact

        Args:
            tid: Tenant ID filter
            sid: Sensor ID filter
            metric_names: Metric names filter
            year: Year filter
            day_number: Day number filter
            time_bucket_no: Time bucket filter
            limit: Limit results

        Returns:
            DataFrame with metrics
        """
        session = self.get_session()

        try:
            query = session.query(MetricsFact, MetricsDim).join(
                MetricsDim, MetricsFact.metric_id == MetricsDim.metric_id
            )

            # Apply filters
            if tid:
                query = query.filter(MetricsFact.tid == tid)
            if sid:
                query = query.filter(MetricsFact.sid == sid)
            if metric_names:
                query = query.filter(MetricsDim.metric_name.in_(metric_names))
            if year:
                query = query.filter(MetricsFact.YearNumber == year)
            if day_number:
                query = query.filter(MetricsFact.DayNumber == day_number)
            if time_bucket_no is not None:
                query = query.filter(MetricsFact.TimeBucketNo == time_bucket_no)

            if limit:
                query = query.limit(limit)

            results = query.all()

            if not results:
                return pd.DataFrame()

            # Convert to DataFrame
            data = []
            for fact, dim in results:
                data.append({
                    'tid': fact.tid,
                    'sid': fact.sid,
                    'metric_name': dim.metric_name,
                    'metric_category': dim.metric_category,
                    'metric_value': fact.metric_value,
                    'year': fact.YearNumber,
                    'day_number': fact.DayNumber,
                    'time_bucket_no': fact.TimeBucketNo,
                    'computed_at': fact.computed_at
                })

            return pd.DataFrame(data)

        except Exception as e:
            self.logger.error(f"Error querying metrics: {e}")
            raise
        finally:
            session.close()

    def close(self):
        """Close database connections"""
        self.engine.dispose()
        self.logger.info("PostgreSQLAdapter connections closed")
