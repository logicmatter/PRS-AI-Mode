"""SQLAlchemy ORM models for IoT Metrics Module"""

from datetime import datetime
from typing import Optional
from sqlalchemy import (
    Column, Integer, String, Float, DateTime, BigInteger, Text,
    ForeignKey, Index, UniqueConstraint, Boolean, create_engine
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, Session

Base = declarative_base()


class DimSensor(Base):
    """
    Dimension table for sensors/points
    Maps to existing dim_sensor table in the source database
    """
    __tablename__ = "dim_sensor"

    sid = Column(Integer, primary_key=True, comment="Sensor ID")
    tid = Column(String(255), nullable=False, index=True, comment="Tenant ID")
    ObjectInstance = Column(String(255), comment="BACnet ObjectInstance")
    ObjectType = Column(String(100), comment="BACnet ObjectType")
    ObjectName = Column(String(255), comment="Sensor Name")
    ObjectDescription = Column(Text, comment="Sensor Description")
    ObjectStatus = Column(String(50), comment="Sensor Status")
    expected_daily_count = Column(Integer, comment="Expected samples per day")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    fact_samples = relationship("FactSample", back_populates="sensor")

    __table_args__ = (
        Index("idx_dim_sensor_tid", "tid"),
        Index("idx_dim_sensor_tid_sid", "tid", "sid"),
    )

    def __repr__(self):
        return f"<DimSensor(sid={self.sid}, tid={self.tid}, name={self.ObjectName})>"


class FactSample(Base):
    """
    Fact table for raw IoT samples
    Maps to existing fact_sample table in the source database
    """
    __tablename__ = "fact_sample"

    sample_id = Column(BigInteger, primary_key=True, autoincrement=True)
    sid = Column(Integer, ForeignKey("dim_sensor.sid"), nullable=False, index=True)
    tid = Column(String(255), nullable=False, index=True)
    Timestamp = Column(DateTime, nullable=False, index=True, comment="Sample timestamp")
    PresentValue = Column(Float, comment="Sensor reading value")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    sensor = relationship("DimSensor", back_populates="fact_samples")

    __table_args__ = (
        Index("idx_fact_sample_sid_timestamp", "sid", "Timestamp"),
        Index("idx_fact_sample_tid_timestamp", "tid", "Timestamp"),
        Index("idx_fact_sample_tid_sid_timestamp", "tid", "sid", "Timestamp"),
    )

    def __repr__(self):
        return f"<FactSample(sid={self.sid}, timestamp={self.Timestamp}, value={self.PresentValue})>"


class MetricsDim(Base):
    """
    Dimension table for metrics definitions
    Lookup table for all computed metrics
    """
    __tablename__ = "metrics_dim"

    metric_id = Column(Integer, primary_key=True, autoincrement=True)
    tid = Column(String(255), nullable=False, index=True)
    sid = Column(Integer, nullable=False, index=True)
    metric_name = Column(String(100), nullable=False, comment="Metric name (e.g., 'Actual_Mean')")
    metric_category = Column(String(50), nullable=False, comment="Category: Base, Behavior, Distribution, Trend, ML")
    unit = Column(String(50), comment="Unit of measurement")
    description = Column(Text, comment="Metric description")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    metric_facts = relationship("MetricsFact", back_populates="metric_def")

    __table_args__ = (
        UniqueConstraint("tid", "sid", "metric_name", name="uq_metrics_dim_tid_sid_name"),
        Index("idx_metrics_dim_tid_sid", "tid", "sid"),
        Index("idx_metrics_dim_category", "metric_category"),
    )

    def __repr__(self):
        return f"<MetricsDim(id={self.metric_id}, name={self.metric_name}, category={self.metric_category})>"


class MetricsFact(Base):
    """
    Fact table for computed metrics values
    Stores time-bucketed KPI values
    Note: Should be partitioned by (YearNumber, DayNumber) in production
    """
    __tablename__ = "metrics_fact"

    metric_fact_id = Column(BigInteger, primary_key=True, autoincrement=True)
    tid = Column(String(255), nullable=False, index=True)
    sid = Column(Integer, nullable=False, index=True)
    metric_id = Column(Integer, ForeignKey("metrics_dim.metric_id"), nullable=False)

    # Time bucketing fields
    YearNumber = Column(Integer, nullable=False, comment="Year (e.g., 2025)")
    DayNumber = Column(Integer, nullable=False, comment="Day of year (1-366)")
    TimeBucketNo = Column(Integer, nullable=False, comment="Bucket number in day (0-95 for 15-min)")

    # Metric value
    metric_value = Column(Float, comment="Computed metric value")

    # Metadata
    computed_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    metric_def = relationship("MetricsDim", back_populates="metric_facts")

    __table_args__ = (
        Index("idx_metrics_fact_tid_sid", "tid", "sid"),
        Index("idx_metrics_fact_time", "YearNumber", "DayNumber", "TimeBucketNo"),
        Index("idx_metrics_fact_tid_sid_time", "tid", "sid", "YearNumber", "DayNumber", "TimeBucketNo"),
        Index("idx_metrics_fact_metric_id", "metric_id"),
        # For anomaly queries
        Index("idx_metrics_fact_metric_value", "metric_id", "metric_value"),
        # Composite unique constraint for upsert operations
        UniqueConstraint("tid", "sid", "metric_id", "YearNumber", "DayNumber", "TimeBucketNo",
                        name="uq_metrics_fact_unique_bucket"),
    )

    def __repr__(self):
        return f"<MetricsFact(tid={self.tid}, sid={self.sid}, year={self.YearNumber}, day={self.DayNumber}, bucket={self.TimeBucketNo})>"


class ComputationLog(Base):
    """
    Log table for tracking computation runs
    Used for monitoring and debugging
    """
    __tablename__ = "computation_log"

    log_id = Column(BigInteger, primary_key=True, autoincrement=True)
    execution_type = Column(String(50), nullable=False, comment="scheduled or on-demand")

    # Time window processed
    YearNumber = Column(Integer, nullable=False)
    DayNumber = Column(Integer, nullable=False)
    TimeBucketNo = Column(Integer, nullable=False)

    # Execution details
    started_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    completed_at = Column(DateTime)
    duration_seconds = Column(Float)

    # Statistics
    sensors_processed = Column(Integer, comment="Number of sensors processed")
    metrics_computed = Column(Integer, comment="Number of metrics computed")
    errors_count = Column(Integer, default=0)

    # Status
    status = Column(String(50), nullable=False, comment="success, failed, partial")
    error_message = Column(Text)

    # Metadata
    triggered_by = Column(String(100), comment="User or scheduler ID")

    __table_args__ = (
        Index("idx_computation_log_time", "YearNumber", "DayNumber", "TimeBucketNo"),
        Index("idx_computation_log_status", "status"),
        Index("idx_computation_log_started", "started_at"),
    )

    def __repr__(self):
        return f"<ComputationLog(id={log_id}, status={self.status}, year={self.YearNumber}, day={self.DayNumber})>"


class MLModelVersion(Base):
    """
    Track ML model versions for clustering and anomaly detection
    """
    __tablename__ = "ml_model_version"

    model_version_id = Column(Integer, primary_key=True, autoincrement=True)
    model_type = Column(String(50), nullable=False, comment="kmeans, anomaly_detector, etc.")
    version = Column(String(50), nullable=False, comment="Version identifier")

    # Training details
    trained_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    training_start_date = Column(DateTime, comment="Start date of training data")
    training_end_date = Column(DateTime, comment="End date of training data")
    training_samples = Column(Integer, comment="Number of samples used for training")

    # Model parameters (stored as JSON-like text)
    parameters = Column(Text, comment="JSON string of model parameters")
    feature_list = Column(Text, comment="JSON array of features used")

    # Performance metrics
    performance_metrics = Column(Text, comment="JSON string of performance metrics")

    # Status
    is_active = Column(Boolean, default=True, comment="Whether this is the active model")
    replaced_at = Column(DateTime, comment="When this model was replaced")
    replaced_by = Column(Integer, comment="Model version that replaced this one")

    __table_args__ = (
        Index("idx_ml_model_type_active", "model_type", "is_active"),
        Index("idx_ml_model_trained_at", "trained_at"),
    )

    def __repr__(self):
        return f"<MLModelVersion(type={self.model_type}, version={self.version}, active={self.is_active})>"


class TenantConfig(Base):
    """
    Tenant-specific configuration overrides
    """
    __tablename__ = "tenant_config"

    config_id = Column(Integer, primary_key=True, autoincrement=True)
    tid = Column(String(255), nullable=False, unique=True, index=True)

    # Tenant settings
    enabled = Column(Boolean, default=True)
    expected_daily_count_override = Column(Integer, comment="Override expected sample count")

    # Feature flags
    enable_ml_processing = Column(Boolean, default=True)
    enable_anomaly_detection = Column(Boolean, default=True)

    # Custom thresholds
    flatline_threshold_override = Column(Float)
    coverage_threshold_override = Column(Float)

    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    notes = Column(Text)

    def __repr__(self):
        return f"<TenantConfig(tid={self.tid}, enabled={self.enabled})>"


def create_tables(engine):
    """Create all tables in the database"""
    Base.metadata.create_all(engine)


def drop_tables(engine):
    """Drop all tables from the database"""
    Base.metadata.drop_all(engine)


def get_table_names():
    """Get list of all table names"""
    return Base.metadata.tables.keys()
