"""FastAPI routes for on-demand metrics computation and querying"""

from typing import Optional, List
from datetime import datetime
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import pandas as pd

from ..config.config import Config
from ..utils.logger import get_context_logger


# Request/Response Models
class ComputeRequest(BaseModel):
    """Request model for on-demand computation"""
    tid: Optional[str] = Field(None, description="Tenant ID filter")
    sid: Optional[List[int]] = Field(None, description="Sensor IDs filter")
    year: int = Field(..., description="Year")
    day_number: int = Field(..., ge=1, le=366, description="Day of year (1-366)")
    time_bucket_no: Optional[int] = Field(None, ge=0, description="Time bucket number (optional)")


class ComputeResponse(BaseModel):
    """Response model for computation"""
    status: str
    message: str
    year: int
    day_number: int
    time_bucket_no: Optional[int]
    metrics_computed: Optional[int] = None
    sensors_processed: Optional[int] = None
    duration_seconds: Optional[float] = None


class QueryRequest(BaseModel):
    """Request model for querying metrics"""
    tid: Optional[str] = None
    sid: Optional[int] = None
    metric_names: Optional[List[str]] = None
    year: Optional[int] = None
    day_number: Optional[int] = None
    time_bucket_no: Optional[int] = None
    limit: Optional[int] = Field(1000, le=10000)


class StatusResponse(BaseModel):
    """Response model for system status"""
    status: str
    scheduler_running: bool
    database_connected: bool
    enabled_kpis_count: int
    next_scheduled_run: Optional[str]


def create_app(config: Config, compute_engine) -> FastAPI:
    """
    Create FastAPI application

    Args:
        config: Configuration object
        compute_engine: MetricsComputeEngine instance

    Returns:
        FastAPI app
    """
    app = FastAPI(
        title="IoT Metrics Module API",
        description="REST API for IoT metrics computation and querying",
        version="1.0.0"
    )

    logger = get_context_logger('api')

    # CORS middleware
    if config.api.enable_cors:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=config.api.cors_origins,
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    @app.get("/", tags=["Health"])
    async def root():
        """Root endpoint"""
        return {"message": "IoT Metrics Module API", "version": "1.0.0"}

    @app.get("/health", tags=["Health"])
    async def health_check():
        """Health check endpoint"""
        return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

    @app.get("/status", response_model=StatusResponse, tags=["Status"])
    async def get_status():
        """Get system status"""
        try:
            # Check database connection
            db_connected = compute_engine.data_loader.test_connection()

            # Get scheduler status
            scheduler_info = compute_engine.scheduler.get_jobs()

            # Get next run time
            next_run = None
            for job in scheduler_info.get('jobs', []):
                if job['id'] == 'metrics_compute_scheduled' and job['next_run_time']:
                    next_run = job['next_run_time']
                    break

            return StatusResponse(
                status="running",
                scheduler_running=scheduler_info['scheduler_running'],
                database_connected=db_connected,
                enabled_kpis_count=len(compute_engine.metrics_compute.enabled_kpis),
                next_scheduled_run=next_run
            )

        except Exception as e:
            logger.error(f"Error getting status: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    @app.post("/compute", response_model=ComputeResponse, tags=["Computation"])
    async def compute_metrics(
        request: ComputeRequest,
        background_tasks: BackgroundTasks
    ):
        """
        Trigger on-demand metrics computation

        Computes metrics for specified bucket(s) and stores results
        """
        try:
            logger.info(f"On-demand compute request: {request.dict()}")

            # Determine which buckets to compute
            if request.time_bucket_no is not None:
                # Single bucket
                buckets = [(request.year, request.day_number, request.time_bucket_no)]
            else:
                # All buckets for the day
                buckets = [
                    (request.year, request.day_number, bucket_no)
                    for bucket_no in range(config.metrics.buckets_per_day)
                ]

            # Trigger computation (can be async if using background_tasks)
            start_time = datetime.utcnow()

            total_metrics = 0
            total_sensors = 0

            for year, day_number, time_bucket_no in buckets:
                result = compute_engine.compute_and_store(
                    year, day_number, time_bucket_no,
                    tid=request.tid,
                    sids=request.sid,
                    execution_type='on-demand'
                )
                total_metrics += result.get('metrics_computed', 0)
                total_sensors += result.get('sensors_processed', 0)

            end_time = datetime.utcnow()
            duration = (end_time - start_time).total_seconds()

            return ComputeResponse(
                status="success",
                message=f"Computed metrics for {len(buckets)} bucket(s)",
                year=request.year,
                day_number=request.day_number,
                time_bucket_no=request.time_bucket_no,
                metrics_computed=total_metrics,
                sensors_processed=total_sensors,
                duration_seconds=duration
            )

        except Exception as e:
            logger.error(f"Error in compute endpoint: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    @app.post("/query", tags=["Query"])
    async def query_metrics(request: QueryRequest):
        """
        Query computed metrics from storage

        Returns metrics matching the specified filters
        """
        try:
            logger.info(f"Query request: {request.dict()}")

            # Query from storage
            metrics_df = compute_engine.storage_adapter.query_metrics(
                tid=request.tid,
                sid=request.sid,
                metric_names=request.metric_names,
                year=request.year,
                day_number=request.day_number,
                time_bucket_no=request.time_bucket_no,
                limit=request.limit
            )

            if metrics_df.empty:
                return {"message": "No metrics found", "data": []}

            # Convert to records
            records = metrics_df.to_dict(orient='records')

            # Convert timestamps to ISO format
            for record in records:
                if 'computed_at' in record and pd.notna(record['computed_at']):
                    record['computed_at'] = record['computed_at'].isoformat()

            return {
                "message": f"Found {len(records)} metrics",
                "count": len(records),
                "data": records
            }

        except Exception as e:
            logger.error(f"Error in query endpoint: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    @app.get("/kpis", tags=["Configuration"])
    async def list_kpis():
        """List all available KPIs"""
        try:
            kpis = compute_engine.metrics_compute.get_kpi_list()
            return {
                "total_kpis": len(kpis),
                "enabled_kpis": len([k for k in kpis if k['enabled']]),
                "kpis": kpis
            }
        except Exception as e:
            logger.error(f"Error listing KPIs: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    @app.get("/scheduler/jobs", tags=["Scheduler"])
    async def list_scheduled_jobs():
        """List all scheduled jobs"""
        try:
            jobs_info = compute_engine.scheduler.get_jobs()
            return jobs_info
        except Exception as e:
            logger.error(f"Error listing jobs: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    @app.post("/scheduler/pause/{job_id}", tags=["Scheduler"])
    async def pause_job(job_id: str):
        """Pause a scheduled job"""
        try:
            compute_engine.scheduler.pause_job(job_id)
            return {"message": f"Job {job_id} paused"}
        except Exception as e:
            logger.error(f"Error pausing job: {e}")
            raise HTTPException(status_code=404, detail=str(e))

    @app.post("/scheduler/resume/{job_id}", tags=["Scheduler"])
    async def resume_job(job_id: str):
        """Resume a paused job"""
        try:
            compute_engine.scheduler.resume_job(job_id)
            return {"message": f"Job {job_id} resumed"}
        except Exception as e:
            logger.error(f"Error resuming job: {e}")
            raise HTTPException(status_code=404, detail=str(e))

    logger.info("FastAPI application created")

    return app
