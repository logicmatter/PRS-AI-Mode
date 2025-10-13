"""Storage adapters module"""

from .postgres_adapter import PostgresAdapter
from .parquet_adapter import ParquetAdapter

__all__ = ["PostgresAdapter", "ParquetAdapter"]
