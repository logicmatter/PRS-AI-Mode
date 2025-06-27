"""
@tbd: Environment variable and dotenv helpers.

Instructions:
- Load .env files if present.
- Provide helper functions to access env variables with defaults.
"""

import os
from dotenv import load_dotenv

load_dotenv()

def get_env_var(key: str, default=None) -> str:
    return os.getenv(key, default)
