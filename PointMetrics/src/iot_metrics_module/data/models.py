"""Pydantic data models for IoT Metrics Module (Parquet-based storage)"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class DimSensor(BaseModel):
    """
    Sensor/Point dimension model
    Represents metadata about IoT sensors
    """
    sid: int = Field(..., description="Sensor ID")
    tid: str = Field(..., description="Tenant ID", max_length=255)
    ObjectInstance: Optional[str] = Field(None, description="BACnet ObjectInstance", max_length=255)
    ObjectType: Optional[str] = Field(None, description="BACnet ObjectType", max_length=100)
    ObjectName: Optional[str] = Field(None, description="Sensor Name", max_length=255)
    ObjectDescription: Optional[str] = Field(None, description="Sensor Description")
    ObjectStatus: Optional[str] = Field(None, description="Sensor Status", max_length=50)
    expected_daily_count: Optional[int] = Field(None, description="Expected samples per day")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Creation timestamp")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "sid": 123,
                "tid": "tenant-abc",
                "ObjectInstance": "AI:1",
                "ObjectType": "AnalogInput",
                "ObjectName": "Temperature Sensor 1",
                "ObjectDescription": "Room temperature sensor",
                "ObjectStatus": "Active",
                "expected_daily_count": 1440
            }
        }
    )


class FactSample(BaseModel):
    """
    Raw IoT sample model
    Represents a single sensor reading at a point in time
    """
    sample_id: Optional[int] = Field(None, description="Sample ID (auto-generated)")
    sid: int = Field(..., description="Sensor ID")
    tid: str = Field(..., description="Tenant ID", max_length=255)
    Timestamp: datetime = Field(..., description="Sample timestamp")
    PresentValue: Optional[float] = Field(None, description="Sensor reading value")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Record creation timestamp")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "sid": 123,
                "tid": "tenant-abc",
                "Timestamp": "2025-01-15T14:30:00",
                "PresentValue": 72.5
            }
        }
    )


class MetricDefinition(BaseModel):
    """
    Metric definition model
    Defines what a metric is and its properties
    """
    metric_name: str = Field(..., description="Metric name (e.g., 'Actual_Mean')", max_length=100)
    metric_category: str = Field(..., description="Category: Base, Behavior, Distribution, Trend, ML", max_length=50)
    unit: Optional[str] = Field(None, description="Unit of measurement", max_length=50)
    description: Optional[str] = Field(None, description="Metric description")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "metric_name": "Actual_Mean",
                "metric_category": "Base",
                "unit": "°C",
                "description": "Mean value of samples in time bucket"
            }
        }
    )


class MetricValue(BaseModel):
    """
    Computed metric value model
    Represents a single computed metric for a sensor at a specific time bucket
    """
    tid: str = Field(..., description="Tenant ID", max_length=255)
    sid: int = Field(..., description="Sensor ID")
    metric_name: str = Field(..., description="Metric name", max_length=100)
    metric_category: str = Field(..., description="Metric category", max_length=50)

    # Time bucketing
    year: int = Field(..., description="Year (e.g., 2025)", ge=2020, le=2100)
    day_number: int = Field(..., description="Day of year (1-366)", ge=1, le=366)
    time_bucket_no: int = Field(..., description="Bucket number in day (0-95 for 15-min)", ge=0, le=95)

    # Value
    metric_value: Optional[float] = Field(None, description="Computed metric value")

    # Metadata
    computed_at: datetime = Field(default_factory=datetime.utcnow, description="Computation timestamp")
    unit: Optional[str] = Field(None, description="Unit of measurement", max_length=50)

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "tid": "tenant-abc",
                "sid": 123,
                "metric_name": "Actual_Mean",
                "metric_category": "Base",
                "year": 2025,
                "day_number": 15,
                "time_bucket_no": 56,
                "metric_value": 72.5,
                "unit": "°C"
            }
        }
    )


class ComputationLog(BaseModel):
    """
    Computation execution log model
    Tracks the execution of metric computation jobs
    """
    log_id: Optional[int] = Field(None, description="Log ID (auto-generated)")
    execution_type: str = Field(..., description="scheduled or on-demand", max_length=50)

    # Time window processed
    year: int = Field(..., description="Year", ge=2020, le=2100)
    day_number: int = Field(..., description="Day of year", ge=1, le=366)
    time_bucket_no: int = Field(..., description="Bucket number", ge=0, le=95)

    # Execution details
    started_at: datetime = Field(..., description="Execution start time")
    completed_at: Optional[datetime] = Field(None, description="Execution completion time")
    duration_seconds: Optional[float] = Field(None, description="Execution duration", ge=0)

    # Statistics
    sensors_processed: int = Field(0, description="Number of sensors processed", ge=0)
    metrics_computed: int = Field(0, description="Number of metrics computed", ge=0)
    errors_count: int = Field(0, description="Number of errors", ge=0)

    # Status
    status: str = Field(..., description="success, failed, partial", max_length=50)
    error_message: Optional[str] = Field(None, description="Error details if failed")

    # Metadata
    triggered_by: Optional[str] = Field(None, description="User or scheduler ID", max_length=100)

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "execution_type": "scheduled",
                "year": 2025,
                "day_number": 15,
                "time_bucket_no": 56,
                "started_at": "2025-01-15T14:15:00",
                "completed_at": "2025-01-15T14:15:02",
                "duration_seconds": 2.1,
                "sensors_processed": 150,
                "metrics_computed": 3750,
                "status": "success",
                "triggered_by": "scheduler"
            }
        }
    )


class MLModelVersion(BaseModel):
    """
    ML model version tracking model
    Tracks different versions of ML models (clustering, anomaly detection)
    """
    model_version_id: Optional[int] = Field(None, description="Model version ID (auto-generated)")
    model_type: str = Field(..., description="kmeans, anomaly_detector, etc.", max_length=50)
    version: str = Field(..., description="Version identifier", max_length=50)

    # Training details
    trained_at: datetime = Field(default_factory=datetime.utcnow, description="Training timestamp")
    training_start_date: Optional[datetime] = Field(None, description="Start date of training data")
    training_end_date: Optional[datetime] = Field(None, description="End date of training data")
    training_samples: Optional[int] = Field(None, description="Number of training samples", ge=0)

    # Model configuration
    parameters: Optional[Dict[str, Any]] = Field(None, description="Model parameters")
    feature_list: Optional[List[str]] = Field(None, description="Features used")

    # Performance metrics
    performance_metrics: Optional[Dict[str, float]] = Field(None, description="Performance metrics")

    # Status
    is_active: bool = Field(True, description="Whether this is the active model")
    replaced_at: Optional[datetime] = Field(None, description="When model was replaced")
    replaced_by: Optional[int] = Field(None, description="Model version that replaced this")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "model_type": "kmeans",
                "version": "v1.0.0",
                "trained_at": "2025-01-15T12:00:00",
                "training_samples": 10000,
                "parameters": {"n_clusters": 3, "max_iter": 300},
                "feature_list": ["Normalized_Count", "Flatline_Pct", "Stddev"],
                "is_active": True
            }
        }
    )


class TenantConfig(BaseModel):
    """
    Tenant-specific configuration model
    Allows per-tenant customization of processing settings
    """
    tid: str = Field(..., description="Tenant ID", max_length=255)

    # Tenant settings
    enabled: bool = Field(True, description="Whether tenant is enabled")
    expected_daily_count_override: Optional[int] = Field(None, description="Override expected sample count", ge=0)

    # Feature flags
    enable_ml_processing: bool = Field(True, description="Enable ML processing")
    enable_anomaly_detection: bool = Field(True, description="Enable anomaly detection")

    # Custom thresholds
    flatline_threshold_override: Optional[float] = Field(None, description="Custom flatline threshold", ge=0, le=1)
    coverage_threshold_override: Optional[float] = Field(None, description="Custom coverage threshold", ge=0, le=1)

    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Creation timestamp")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Last update timestamp")
    notes: Optional[str] = Field(None, description="Configuration notes")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "tid": "tenant-abc",
                "enabled": True,
                "expected_daily_count_override": 1440,
                "enable_ml_processing": True,
                "enable_anomaly_detection": True,
                "flatline_threshold_override": 0.05,
                "notes": "Custom configuration for high-frequency sensors"
            }
        }
    )


# Helper functions for data validation and conversion

def validate_time_bucket(year: int, day_number: int, time_bucket_no: int) -> bool:
    """Validate time bucket coordinates"""
    if year < 2020 or year > 2100:
        return False
    if day_number < 1 or day_number > 366:
        return False
    if time_bucket_no < 0 or time_bucket_no > 95:
        return False
    return True


def get_bucket_timestamp(year: int, day_number: int, time_bucket_no: int, bucket_minutes: int = 15) -> datetime:
    """Convert bucket coordinates to timestamp"""
    from datetime import timedelta

    # Create date from year and day_number
    base_date = datetime(year, 1, 1) + timedelta(days=day_number - 1)

    # Add bucket offset
    bucket_offset = timedelta(minutes=time_bucket_no * bucket_minutes)

    return base_date + bucket_offset


def timestamp_to_bucket(timestamp: datetime, bucket_minutes: int = 15) -> tuple[int, int, int]:
    """Convert timestamp to bucket coordinates (year, day_number, time_bucket_no)"""
    year = timestamp.year
    day_number = timestamp.timetuple().tm_yday

    # Calculate bucket number within the day
    minutes_since_midnight = timestamp.hour * 60 + timestamp.minute
    time_bucket_no = minutes_since_midnight // bucket_minutes

    return year, day_number, time_bucket_no
