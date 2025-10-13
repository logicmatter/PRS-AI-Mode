"""Job scheduler for automated metrics computation"""

from typing import Optional, Callable, Dict, Any
from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger

from ..config.config import Config
from ..utils.logger import get_context_logger
from ..utils.helpers import get_current_bucket_info, get_previous_bucket_info


class JobScheduler:
    """
    Job scheduler for automating metrics computation at regular intervals
    """

    def __init__(self, config: Config):
        """
        Initialize job scheduler

        Args:
            config: Configuration object
        """
        self.config = config
        self.logger = get_context_logger('scheduler')

        # Initialize APScheduler
        self.scheduler = BackgroundScheduler(
            timezone='UTC',
            job_defaults={
                'coalesce': config.scheduler.job_coalesce,
                'max_instances': config.scheduler.job_max_instances,
                'misfire_grace_time': config.scheduler.job_misfire_grace_time
            }
        )

        self.compute_job_func: Optional[Callable] = None
        self.is_running = False

        self.logger.info("JobScheduler initialized")

    def set_compute_function(self, func: Callable):
        """
        Set the metrics computation function to be called by scheduler

        Args:
            func: Function that computes metrics for a bucket
                 Should accept (year, day_number, time_bucket_no) as arguments
        """
        self.compute_job_func = func
        self.logger.info("Compute function registered with scheduler")

    def add_scheduled_job(self):
        """
        Add the main scheduled job for metrics computation
        Runs every N minutes (configured interval)
        """
        if self.compute_job_func is None:
            raise ValueError("Compute function not set. Call set_compute_function() first.")

        # Calculate cron expression for interval
        interval_minutes = self.config.scheduler.job_interval_minutes

        # Create trigger for every N minutes at specific offsets
        # E.g., for 15-min intervals: run at :00, :15, :30, :45
        minute_values = list(range(0, 60, interval_minutes))
        minute_expr = ','.join(str(m) for m in minute_values)

        # Add job with cron trigger
        self.scheduler.add_job(
            func=self._execute_compute_job,
            trigger=CronTrigger(minute=minute_expr),
            id='metrics_compute_scheduled',
            name='Metrics Computation (Scheduled)',
            replace_existing=True
        )

        self.logger.info(
            f"Scheduled job added: every {interval_minutes} minutes at {minute_values}"
        )

    def _execute_compute_job(self):
        """
        Execute the metrics computation job
        Computes metrics for the previous completed bucket
        """
        try:
            # Get current bucket info
            current_year, current_day, current_bucket = get_current_bucket_info(
                self.config.metrics.bucket_interval_minutes
            )

            # Compute metrics for the previous bucket (just completed)
            prev_year, prev_day, prev_bucket = get_previous_bucket_info(
                current_year, current_day, current_bucket,
                self.config.metrics.bucket_interval_minutes
            )

            self.logger.info(
                f"Executing scheduled computation for bucket: "
                f"year={prev_year}, day={prev_day}, bucket={prev_bucket}"
            )

            # Call the compute function
            if self.compute_job_func:
                self.compute_job_func(prev_year, prev_day, prev_bucket)

        except Exception as e:
            self.logger.error(f"Error in scheduled job execution: {e}", exc_info=True)

    def trigger_on_demand_job(
        self,
        year: int,
        day_number: int,
        time_bucket_no: int
    ):
        """
        Trigger an on-demand computation job

        Args:
            year: Year
            day_number: Day of year
            time_bucket_no: Time bucket number
        """
        if self.compute_job_func is None:
            raise ValueError("Compute function not set")

        self.logger.info(
            f"Triggering on-demand computation: "
            f"year={year}, day={day_number}, bucket={time_bucket_no}"
        )

        # Execute immediately in a background job
        self.scheduler.add_job(
            func=self.compute_job_func,
            trigger='date',  # Run once immediately
            args=[year, day_number, time_bucket_no],
            id=f'on_demand_{year}_{day_number}_{time_bucket_no}',
            name=f'On-Demand Computation ({year}-{day_number}-{time_bucket_no})',
            replace_existing=True
        )

    def start(self):
        """Start the scheduler"""
        if not self.scheduler.running:
            self.scheduler.start()
            self.is_running = True
            self.logger.info("Scheduler started")
        else:
            self.logger.warning("Scheduler already running")

    def stop(self):
        """Stop the scheduler"""
        if self.scheduler.running:
            self.scheduler.shutdown(wait=True)
            self.is_running = False
            self.logger.info("Scheduler stopped")

    def get_jobs(self) -> Dict[str, Any]:
        """
        Get information about scheduled jobs

        Returns:
            Dictionary with job information
        """
        jobs = []
        for job in self.scheduler.get_jobs():
            jobs.append({
                'id': job.id,
                'name': job.name,
                'next_run_time': job.next_run_time.isoformat() if job.next_run_time else None,
                'trigger': str(job.trigger)
            })

        return {
            'scheduler_running': self.scheduler.running,
            'job_count': len(jobs),
            'jobs': jobs
        }

    def pause_job(self, job_id: str):
        """Pause a specific job"""
        self.scheduler.pause_job(job_id)
        self.logger.info(f"Job paused: {job_id}")

    def resume_job(self, job_id: str):
        """Resume a paused job"""
        self.scheduler.resume_job(job_id)
        self.logger.info(f"Job resumed: {job_id}")
