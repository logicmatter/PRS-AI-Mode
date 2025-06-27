"""
@tbd: Global configuration management for Metrics modules.

Instructions:
- Centralize DB credentials, tenant configs, thresholds.
- Use environment variables or config files.
- Provide a get_config() function returning config object/dict.
"""

import os
from typing import Any

def get_config() -> Any:
    """
    Load and return configuration.
    @tbd: Enhance with pydantic or YAML if needed.
    """
    config = {
    "db_host": "localhost",
    "db_name": "metricsdb",
    "db_user": "metrics_user",
    "db_password": "secret",
    "db_port": 5432
    }
    return config
