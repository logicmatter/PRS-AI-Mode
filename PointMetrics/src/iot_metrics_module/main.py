"""Main entry point for IoT Metrics Module"""

import sys
import signal
from typing import Optional, Dict, Any, List
from datetime import datetime
import uvicorn

from .config.config import get_config, Config
from .data.loader import DataLoader
from .data.models import create_tables
from .metrics.compute import MetricsCompute
from .ml.clustering import ClusteringPipeline
from .ml.anomaly import AnomalyDetector
from .storage.postgres_adapter import PostgreSQLAdapter
from .storage.parquet_adapter import ParquetAdapter
from .scheduler.job_scheduler import JobScheduler
from .api.routes import create_app
from .utils.logger import init_module_logger, get_module_logger
from .utils.helpers import get_bucket_history_range


class MetricsComputeEngine:
    """
    Main engine that orchestrates all components
    """

    def __init__(self, config: Optional[Config] = None):
        """
        Initialize the metrics compute engine

        Args:
            config: Configuration object (if None, loads from environment)
        """
        self.config = config or get_config()

        # Initialize logger
        self.logger = init_module_logger(self.config)
        self.logger.info("=== Initializing IoT Metrics Module ===")

        # Initialize components
        self.data_loader = DataLoader(self.config)
        self.storage_adapter = PostgreSQLAdapter(self.config)
        self.metrics_compute = MetricsCompute(self.config, self.data_loader)
        self.clustering_pipeline = ClusteringPipeline(self.config)
        self.anomaly_detector = AnomalyDetector(self.config)
        self.scheduler = JobScheduler(self.config)

        # Optional: Parquet adapter
        if self.config.storage.enable_parquet_archive:
            self.parquet_adapter = ParquetAdapter(self.config)
        else:
            self.parquet_adapter = None

        # FastAPI app
        self.app = None

        self.logger.info("All components initialized successfully")

    def initialize_database(self):
        """Initialize database tables"""
        self.logger.info("Creating database tables...")
        self.storage_adapter.create_tables()
        self.logger.info("Database tables created")

    def compute_and_store(
        self,
        year: int,
        day_number: int,
        time_bucket_no: int,
        tid: Optional[str] = None,
        sids: Optional[List[int]] = None,
        execution_type: str = 'scheduled'
    ) -> Dict[str, Any]:
        """
        Compute metrics for a bucket and store results

        Args:
            year: Year
            day_number: Day of year
            time_bucket_no: Time bucket number
            tid: Tenant ID filter (optional)
            sids: Sensor IDs filter (optional)
            execution_type: Execution type (scheduled or on-demand)

        Returns:
            Dictionary with execution results
        """
        start_time = datetime.utcnow()

        try:
            self.logger.info(
                f"Computing metrics: year={year}, day={day_number}, "
                f"bucket={time_bucket_no}, type={execution_type}"
            )

            # 1. Compute base metrics
            metrics_df = self.metrics_compute.compute_metrics_for_bucket(
                year, day_number, time_bucket_no,
                tid=tid, sids=sids
            )

            if metrics_df.empty:
                self.logger.warning("No metrics computed")
                return {
                    'status': 'success',
                    'sensors_processed': 0,
                    'metrics_computed': 0,
                    'message': 'No data available'
                }

            # Get stats
            sensors_processed = metrics_df['sid'].nunique() if not metrics_df.empty else 0
            metrics_computed = len(metrics_df)

            # 2. Store metrics in PostgreSQL
            storage_stats = self.storage_adapter.store_metrics(metrics_df)

            # 3. Optionally store in Parquet
            if self.parquet_adapter:
                # Add month column for parquet partitioning
                metrics_df['month'] = metrics_df.apply(
                    lambda row: datetime.strptime(
                        f"{row['year']}-{row['day_number']}", "%Y-%j"
                    ).month,
                    axis=1
                )
                self.parquet_adapter.write_metrics(metrics_df)

            # 4. Run ML pipelines if enabled
            ml_results = {}
            if self.config.metrics.enable_ml_metrics:
                try:
                    # Clustering
                    if self.clustering_pipeline.kmeans is not None:
                        cluster_df = self.clustering_pipeline.predict(metrics_df)
                        ml_results['clustering'] = {
                            'clusters_assigned': len(cluster_df)
                        }

                    # Anomaly detection
                    if self.config.metrics.enable_ml_metrics:
                        # Get historical data for comparison
                        historical_buckets = get_bucket_history_range(
                            year, day_number, time_bucket_no,
                            history_days=self.config.metrics.historical_window_days,
                            bucket_interval_minutes=self.config.metrics.bucket_interval_minutes
                        )

                        # Query historical metrics
                        historical_metrics = pd.DataFrame()
                        for hist_coords in historical_buckets[:7]:  # Last 7 days
                            hist_df = self.storage_adapter.query_metrics(
                                tid=tid,
                                year=hist_coords[0],
                                day_number=hist_coords[1],
                                time_bucket_no=hist_coords[2]
                            )
                            if not hist_df.empty:
                                historical_metrics = pd.concat(
                                    [historical_metrics, hist_df],
                                    ignore_index=True
                                )

                        # Detect anomalies
                        anomaly_df = self.anomaly_detector.detect_anomalies(
                            metrics_df, historical_metrics
                        )

                        if not anomaly_df.empty:
                            ml_results['anomaly_detection'] = self.anomaly_detector.get_anomaly_summary(anomaly_df)

                except Exception as e:
                    self.logger.error(f"Error in ML pipelines: {e}")

            # 5. Log computation
            end_time = datetime.utcnow()
            self.storage_adapter.log_computation(
                execution_type=execution_type,
                year=year,
                day_number=day_number,
                time_bucket_no=time_bucket_no,
                started_at=start_time,
                completed_at=end_time,
                sensors_processed=sensors_processed,
                metrics_computed=metrics_computed,
                status='success',
                triggered_by='system'
            )

            duration = (end_time - start_time).total_seconds()
            self.logger.info(
                f"Computation completed: {sensors_processed} sensors, "
                f"{metrics_computed} metrics, {duration:.2f}s"
            )

            return {
                'status': 'success',
                'sensors_processed': sensors_processed,
                'metrics_computed': metrics_computed,
                'storage_stats': storage_stats,
                'ml_results': ml_results,
                'duration_seconds': duration
            }

        except Exception as e:
            # Log error
            end_time = datetime.utcnow()
            self.logger.error(f"Error in compute_and_store: {e}", exc_info=True)

            try:
                self.storage_adapter.log_computation(
                    execution_type=execution_type,
                    year=year,
                    day_number=day_number,
                    time_bucket_no=time_bucket_no,
                    started_at=start_time,
                    completed_at=end_time,
                    sensors_processed=0,
                    metrics_computed=0,
                    status='failed',
                    error_message=str(e),
                    triggered_by='system'
                )
            except Exception as log_error:
                self.logger.error(f"Error logging computation failure: {log_error}")

            raise

    def start_scheduler(self):
        """Start the scheduler for automated computation"""
        if not self.config.scheduler.enable_scheduled_jobs:
            self.logger.info("Scheduled jobs disabled in configuration")
            return

        # Set compute function
        self.scheduler.set_compute_function(
            lambda year, day, bucket: self.compute_and_store(year, day, bucket)
        )

        # Add scheduled job
        self.scheduler.add_scheduled_job()

        # Start scheduler
        self.scheduler.start()

    def start_api(self):
        """Start the FastAPI server"""
        self.logger.info("Starting API server...")

        # Create FastAPI app
        self.app = create_app(self.config, self)

        # Run with uvicorn
        uvicorn.run(
            self.app,
            host=self.config.api.host,
            port=self.config.api.port,
            reload=self.config.api.reload,
            log_level=self.config.api.log_level
        )

    def shutdown(self):
        """Shutdown all components gracefully"""
        self.logger.info("Shutting down IoT Metrics Module...")

        # Stop scheduler
        if self.scheduler.is_running:
            self.scheduler.stop()

        # Close database connections
        self.data_loader.close()
        self.storage_adapter.close()

        self.logger.info("Shutdown complete")


def signal_handler(signum, frame):
    """Handle shutdown signals"""
    logger = get_module_logger()
    logger.info(f"Received signal {signum}, initiating shutdown...")
    sys.exit(0)


def main():
    """Main entry point"""
    # Setup signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    # Load configuration
    config = get_config()

    # Create engine
    engine = MetricsComputeEngine(config)

    # Initialize database (create tables if needed)
    engine.initialize_database()

    # Test database connection
    if not engine.data_loader.test_connection():
        engine.logger.error("Database connection failed!")
        sys.exit(1)

    # Start scheduler
    engine.start_scheduler()

    # Start API server (blocks until shutdown)
    engine.start_api()

    # Cleanup on exit
    engine.shutdown()


if __name__ == "__main__":
    main()
