"""Configuration management for IoT Metrics Module"""

import os
from typing import Dict, List, Optional, Any
from pathlib import Path
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class DatabaseConfig(BaseSettings):
    """Database configuration settings"""

    host: str = Field(default="localhost", env="DB_HOST")
    port: int = Field(default=5432, env="DB_PORT")
    user: str = Field(default="postgres", env="DB_USER")
    password: str = Field(default="", env="DB_PASSWORD")
    database: str = Field(default="iot_metrics", env="DB_NAME")
    pool_size: int = Field(default=10, env="DB_POOL_SIZE")
    max_overflow: int = Field(default=20, env="DB_MAX_OVERFLOW")

    model_config = SettingsConfigDict(env_prefix="DB_")

    @property
    def connection_string(self) -> str:
        """Generate SQLAlchemy connection string"""
        return f"postgresql://{self.user}:{self.password}@{self.host}:{self.port}/{self.database}"


class MetricsConfig(BaseSettings):
    """Metrics computation configuration"""

    # Bucket settings
    bucket_interval_minutes: int = Field(default=15, env="METRICS_BUCKET_INTERVAL")
    buckets_per_day: int = Field(default=96, env="METRICS_BUCKETS_PER_DAY")  # 24*60/15

    # Computation settings
    enable_base_metrics: bool = Field(default=True, env="METRICS_ENABLE_BASE")
    enable_behavior_metrics: bool = Field(default=True, env="METRICS_ENABLE_BEHAVIOR")
    enable_distribution_metrics: bool = Field(default=True, env="METRICS_ENABLE_DISTRIBUTION")
    enable_trend_metrics: bool = Field(default=True, env="METRICS_ENABLE_TREND")
    enable_ml_metrics: bool = Field(default=True, env="METRICS_ENABLE_ML")

    # Thresholds
    flatline_threshold: float = Field(default=0.01, env="METRICS_FLATLINE_THRESHOLD")
    outlier_zscore_threshold: float = Field(default=3.0, env="METRICS_OUTLIER_ZSCORE")
    coverage_min_threshold: float = Field(default=0.8, env="METRICS_COVERAGE_MIN")

    # Historical comparison
    historical_window_days: int = Field(default=7, env="METRICS_HISTORICAL_WINDOW")
    anomaly_drift_threshold: float = Field(default=2.0, env="METRICS_ANOMALY_DRIFT")

    model_config = SettingsConfigDict(env_prefix="METRICS_")


class MLConfig(BaseSettings):
    """Machine Learning configuration"""

    # K-Means clustering
    kmeans_n_clusters: int = Field(default=3, env="ML_KMEANS_CLUSTERS")
    kmeans_max_iter: int = Field(default=300, env="ML_KMEANS_MAX_ITER")
    kmeans_n_init: int = Field(default=10, env="ML_KMEANS_N_INIT")
    kmeans_refit_days: int = Field(default=7, env="ML_KMEANS_REFIT_DAYS")

    # Feature selection for clustering
    clustering_features: List[str] = Field(
        default=[
            "Normalized_Count",
            "Flatline_Pct",
            "Outlier_Count",
            "Stddev",
            "Slope_Trend"
        ],
        env="ML_CLUSTERING_FEATURES"
    )

    # Anomaly detection
    anomaly_window_buckets: int = Field(default=672, env="ML_ANOMALY_WINDOW")  # 7 days
    anomaly_zscore_threshold: float = Field(default=2.0, env="ML_ANOMALY_ZSCORE")

    model_config = SettingsConfigDict(env_prefix="ML_")


class StorageConfig(BaseSettings):
    """Storage configuration"""

    # PostgreSQL retention
    postgres_retention_days: int = Field(default=90, env="STORAGE_PG_RETENTION_DAYS")

    # Parquet archival
    enable_parquet_archive: bool = Field(default=True, env="STORAGE_ENABLE_PARQUET")
    parquet_base_path: str = Field(default="/data/metrics-archive", env="STORAGE_PARQUET_PATH")
    parquet_compression: str = Field(default="snappy", env="STORAGE_PARQUET_COMPRESSION")
    archive_after_days: int = Field(default=90, env="STORAGE_ARCHIVE_AFTER_DAYS")

    # Partitioning
    enable_partitioning: bool = Field(default=True, env="STORAGE_ENABLE_PARTITIONING")
    partition_type: str = Field(default="daily", env="STORAGE_PARTITION_TYPE")

    model_config = SettingsConfigDict(env_prefix="STORAGE_")


class SchedulerConfig(BaseSettings):
    """Scheduler configuration"""

    # Scheduler type
    scheduler_type: str = Field(default="apscheduler", env="SCHEDULER_TYPE")  # apscheduler or celery

    # APScheduler settings
    enable_scheduled_jobs: bool = Field(default=True, env="SCHEDULER_ENABLE")
    job_interval_minutes: int = Field(default=15, env="SCHEDULER_INTERVAL")
    job_misfire_grace_time: int = Field(default=300, env="SCHEDULER_MISFIRE_GRACE")
    job_coalesce: bool = Field(default=True, env="SCHEDULER_COALESCE")
    job_max_instances: int = Field(default=1, env="SCHEDULER_MAX_INSTANCES")

    # Celery settings (if using Celery)
    celery_broker_url: str = Field(default="redis://localhost:6379/0", env="CELERY_BROKER_URL")
    celery_result_backend: str = Field(default="redis://localhost:6379/0", env="CELERY_RESULT_BACKEND")

    model_config = SettingsConfigDict(env_prefix="SCHEDULER_")


class APIConfig(BaseSettings):
    """API configuration"""

    host: str = Field(default="0.0.0.0", env="API_HOST")
    port: int = Field(default=8000, env="API_PORT")
    reload: bool = Field(default=False, env="API_RELOAD")
    log_level: str = Field(default="info", env="API_LOG_LEVEL")

    # CORS
    enable_cors: bool = Field(default=True, env="API_ENABLE_CORS")
    cors_origins: List[str] = Field(default=["*"], env="API_CORS_ORIGINS")

    # Authentication
    enable_auth: bool = Field(default=False, env="API_ENABLE_AUTH")
    jwt_secret: str = Field(default="change-me-in-production", env="API_JWT_SECRET")
    jwt_algorithm: str = Field(default="HS256", env="API_JWT_ALGORITHM")

    model_config = SettingsConfigDict(env_prefix="API_")


class TenantConfig(BaseSettings):
    """Tenant configuration"""

    # Tenant list (comma-separated string or JSON file path)
    tenant_ids: List[str] = Field(default=[], env="TENANT_IDS")
    tenant_config_file: Optional[str] = Field(default=None, env="TENANT_CONFIG_FILE")

    # Default expected sample counts
    default_expected_daily_count: int = Field(default=1440, env="TENANT_DEFAULT_DAILY_COUNT")  # 1/min

    model_config = SettingsConfigDict(env_prefix="TENANT_")


class LoggingConfig(BaseSettings):
    """Logging configuration"""

    log_level: str = Field(default="INFO", env="LOG_LEVEL")
    log_format: str = Field(default="json", env="LOG_FORMAT")  # json or text
    log_file: Optional[str] = Field(default=None, env="LOG_FILE")
    log_max_bytes: int = Field(default=10485760, env="LOG_MAX_BYTES")  # 10MB
    log_backup_count: int = Field(default=5, env="LOG_BACKUP_COUNT")

    model_config = SettingsConfigDict(env_prefix="LOG_")


class Config(BaseSettings):
    """Main configuration class"""

    # Environment
    environment: str = Field(default="development", env="ENVIRONMENT")
    debug: bool = Field(default=False, env="DEBUG")

    # Sub-configurations
    database: DatabaseConfig = Field(default_factory=DatabaseConfig)
    metrics: MetricsConfig = Field(default_factory=MetricsConfig)
    ml: MLConfig = Field(default_factory=MLConfig)
    storage: StorageConfig = Field(default_factory=StorageConfig)
    scheduler: SchedulerConfig = Field(default_factory=SchedulerConfig)
    api: APIConfig = Field(default_factory=APIConfig)
    tenant: TenantConfig = Field(default_factory=TenantConfig)
    logging: LoggingConfig = Field(default_factory=LoggingConfig)

    # Processing settings
    parallel_processing: bool = Field(default=True, env="PARALLEL_PROCESSING")
    max_workers: int = Field(default=4, env="MAX_WORKERS")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False
    )

    def get_tenant_configs(self) -> Dict[str, Dict[str, Any]]:
        """Load tenant-specific configurations"""
        if self.tenant.tenant_config_file and os.path.exists(self.tenant.tenant_config_file):
            import json
            with open(self.tenant.tenant_config_file, 'r') as f:
                return json.load(f)

        # Return default config for each tenant
        return {
            tid: {
                "expected_daily_count": self.tenant.default_expected_daily_count,
                "enabled": True
            }
            for tid in self.tenant.tenant_ids
        }

    def validate_config(self) -> bool:
        """Validate configuration settings"""
        errors = []

        # Validate bucket settings
        if self.metrics.bucket_interval_minutes <= 0:
            errors.append("Bucket interval must be positive")

        if 1440 % self.metrics.bucket_interval_minutes != 0:
            errors.append("Bucket interval must divide evenly into 1440 minutes")

        # Validate database
        if not self.database.host or not self.database.database:
            errors.append("Database host and name are required")

        # Validate ML settings
        if self.ml.kmeans_n_clusters < 2:
            errors.append("K-means requires at least 2 clusters")

        # Validate storage
        if self.storage.enable_parquet_archive:
            parquet_path = Path(self.storage.parquet_base_path)
            if not parquet_path.exists():
                try:
                    parquet_path.mkdir(parents=True, exist_ok=True)
                except Exception as e:
                    errors.append(f"Cannot create parquet path: {e}")

        if errors:
            raise ValueError(f"Configuration validation failed: {'; '.join(errors)}")

        return True


# Global configuration instance
_config: Optional[Config] = None


def get_config() -> Config:
    """Get or create the global configuration instance"""
    global _config
    if _config is None:
        _config = Config()
        _config.validate_config()
    return _config


def reset_config():
    """Reset the global configuration (useful for testing)"""
    global _config
    _config = None


def load_config_from_file(config_file: str) -> Config:
    """Load configuration from a specific file"""
    global _config
    _config = Config(_env_file=config_file)
    _config.validate_config()
    return _config
