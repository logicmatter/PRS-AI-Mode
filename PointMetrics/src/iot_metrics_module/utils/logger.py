"""Logging configuration and utilities"""

import logging
import sys
from datetime import datetime
from pathlib import Path
from typing import Optional
from logging.handlers import RotatingFileHandler
from pythonjsonlogger import jsonlogger


class CustomJsonFormatter(jsonlogger.JsonFormatter):
    """Custom JSON formatter with additional fields"""

    def add_fields(self, log_record, record, message_dict):
        super().add_fields(log_record, record, message_dict)
        log_record['timestamp'] = datetime.utcnow().isoformat()
        log_record['level'] = record.levelname
        log_record['logger'] = record.name
        if hasattr(record, 'tid'):
            log_record['tid'] = record.tid
        if hasattr(record, 'sid'):
            log_record['sid'] = record.sid


def setup_logger(
    name: str,
    log_level: str = "INFO",
    log_format: str = "json",
    log_file: Optional[str] = None,
    max_bytes: int = 10485760,  # 10MB
    backup_count: int = 5
) -> logging.Logger:
    """
    Set up a logger with console and optional file handlers

    Args:
        name: Logger name
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_format: Format type (json or text)
        log_file: Optional file path for file logging
        max_bytes: Maximum size of log file before rotation
        backup_count: Number of backup files to keep

    Returns:
        Configured logger instance
    """
    logger = logging.getLogger(name)
    logger.setLevel(getattr(logging, log_level.upper()))

    # Remove existing handlers
    logger.handlers.clear()

    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(getattr(logging, log_level.upper()))

    if log_format == "json":
        # JSON format
        formatter = CustomJsonFormatter(
            '%(timestamp)s %(level)s %(name)s %(message)s'
        )
    else:
        # Text format
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )

    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

    # File handler (if specified)
    if log_file:
        log_path = Path(log_file)
        log_path.parent.mkdir(parents=True, exist_ok=True)

        file_handler = RotatingFileHandler(
            log_file,
            maxBytes=max_bytes,
            backupCount=backup_count
        )
        file_handler.setLevel(getattr(logging, log_level.upper()))
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)

    return logger


def get_logger(name: str) -> logging.Logger:
    """
    Get an existing logger by name

    Args:
        name: Logger name

    Returns:
        Logger instance
    """
    return logging.getLogger(name)


class LoggerAdapter(logging.LoggerAdapter):
    """
    Custom logger adapter for adding contextual information
    """

    def process(self, msg, kwargs):
        """Add extra context to log records"""
        # Add tenant and sensor IDs if available in extra
        if 'extra' not in kwargs:
            kwargs['extra'] = {}

        if self.extra:
            kwargs['extra'].update(self.extra)

        return msg, kwargs


def get_context_logger(name: str, **context) -> LoggerAdapter:
    """
    Get a logger with contextual information

    Args:
        name: Logger name
        **context: Context key-value pairs (e.g., tid, sid)

    Returns:
        LoggerAdapter with context

    Example:
        logger = get_context_logger('metrics.compute', tid='tenant-1', sid=123)
        logger.info('Computing metrics')  # Will include tid and sid in logs
    """
    logger = get_logger(name)
    return LoggerAdapter(logger, context)


# Module-level logger
_module_logger: Optional[logging.Logger] = None


def init_module_logger(config):
    """
    Initialize the module-level logger from configuration

    Args:
        config: Configuration object with logging settings
    """
    global _module_logger
    _module_logger = setup_logger(
        name="iot_metrics_module",
        log_level=config.logging.log_level,
        log_format=config.logging.log_format,
        log_file=config.logging.log_file,
        max_bytes=config.logging.log_max_bytes,
        backup_count=config.logging.log_backup_count
    )
    return _module_logger


def get_module_logger() -> logging.Logger:
    """
    Get the module-level logger

    Returns:
        Module logger instance
    """
    global _module_logger
    if _module_logger is None:
        # Fallback to basic logger if not initialized
        _module_logger = setup_logger("iot_metrics_module")
    return _module_logger
