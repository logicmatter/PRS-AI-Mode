"""
IoT Metrics Aggregation Module (IMAE)
Building Monitoring Analytics & Diagnostics

A production-grade system for computing KPIs on time-series IoT sensor data.
"""

__version__ = "1.0.0"
__author__ = "BMAD Team"
__license__ = "MIT"

from .main import main, MetricsComputeEngine
from .config.config import get_config, Config

__all__ = ["main", "MetricsComputeEngine", "get_config", "Config"]
