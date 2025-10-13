"""Helper functions and utilities"""

from datetime import datetime, timedelta
from typing import Tuple, List, Dict, Any, Optional
import pandas as pd
import numpy as np


def get_time_bucket_info(dt: datetime, bucket_interval_minutes: int = 15) -> Tuple[int, int, int]:
    """
    Convert datetime to year, day number, and time bucket number

    Args:
        dt: Datetime object
        bucket_interval_minutes: Bucket interval in minutes (default: 15)

    Returns:
        Tuple of (year, day_number, time_bucket_no)

    Example:
        >>> get_time_bucket_info(datetime(2025, 1, 15, 14, 30))
        (2025, 15, 58)  # 58th bucket of the day (14:30 = 14*4 + 2)
    """
    year = dt.year
    day_number = dt.timetuple().tm_yday  # Day of year (1-366)

    # Calculate bucket number within the day
    minutes_since_midnight = dt.hour * 60 + dt.minute
    time_bucket_no = minutes_since_midnight // bucket_interval_minutes

    return year, day_number, time_bucket_no


def get_bucket_datetime_range(
    year: int,
    day_number: int,
    time_bucket_no: int,
    bucket_interval_minutes: int = 15
) -> Tuple[datetime, datetime]:
    """
    Convert year, day number, and bucket number to datetime range

    Args:
        year: Year
        day_number: Day of year (1-366)
        time_bucket_no: Bucket number within the day
        bucket_interval_minutes: Bucket interval in minutes

    Returns:
        Tuple of (start_datetime, end_datetime)

    Example:
        >>> get_bucket_datetime_range(2025, 15, 58)
        (datetime(2025, 1, 15, 14, 30), datetime(2025, 1, 15, 14, 45))
    """
    # Create datetime for the start of the year
    year_start = datetime(year, 1, 1)

    # Add days to get to the correct day
    target_date = year_start + timedelta(days=day_number - 1)

    # Calculate minutes from start of day
    minutes_from_midnight = time_bucket_no * bucket_interval_minutes

    # Create start datetime
    start_dt = datetime(
        target_date.year,
        target_date.month,
        target_date.day
    ) + timedelta(minutes=minutes_from_midnight)

    # Create end datetime
    end_dt = start_dt + timedelta(minutes=bucket_interval_minutes)

    return start_dt, end_dt


def get_current_bucket_info(bucket_interval_minutes: int = 15) -> Tuple[int, int, int]:
    """
    Get the current time bucket info

    Args:
        bucket_interval_minutes: Bucket interval in minutes

    Returns:
        Tuple of (year, day_number, time_bucket_no)
    """
    return get_time_bucket_info(datetime.utcnow(), bucket_interval_minutes)


def get_previous_bucket_info(
    year: int,
    day_number: int,
    time_bucket_no: int,
    bucket_interval_minutes: int = 15
) -> Tuple[int, int, int]:
    """
    Get the previous time bucket info

    Args:
        year: Current year
        day_number: Current day number
        time_bucket_no: Current bucket number
        bucket_interval_minutes: Bucket interval in minutes

    Returns:
        Tuple of (prev_year, prev_day_number, prev_time_bucket_no)
    """
    if time_bucket_no > 0:
        return year, day_number, time_bucket_no - 1

    # Previous day
    start_dt, _ = get_bucket_datetime_range(year, day_number, 0, bucket_interval_minutes)
    prev_dt = start_dt - timedelta(minutes=bucket_interval_minutes)
    return get_time_bucket_info(prev_dt, bucket_interval_minutes)


def group_samples_by_bucket(
    df: pd.DataFrame,
    bucket_interval_minutes: int = 15,
    timestamp_col: str = "Timestamp"
) -> pd.DataFrame:
    """
    Group samples into time buckets and add bucket information

    Args:
        df: DataFrame with timestamp column
        bucket_interval_minutes: Bucket interval in minutes
        timestamp_col: Name of timestamp column

    Returns:
        DataFrame with added bucket columns
    """
    if df.empty:
        df['YearNumber'] = []
        df['DayNumber'] = []
        df['TimeBucketNo'] = []
        return df

    # Ensure timestamp is datetime
    df[timestamp_col] = pd.to_datetime(df[timestamp_col])

    # Compute bucket info for each row
    bucket_info = df[timestamp_col].apply(
        lambda x: get_time_bucket_info(x, bucket_interval_minutes)
    )

    df['YearNumber'] = bucket_info.apply(lambda x: x[0])
    df['DayNumber'] = bucket_info.apply(lambda x: x[1])
    df['TimeBucketNo'] = bucket_info.apply(lambda x: x[2])

    return df


def calculate_expected_count(
    expected_daily_count: int,
    bucket_interval_minutes: int = 15
) -> int:
    """
    Calculate expected sample count for a time bucket

    Args:
        expected_daily_count: Expected samples per day
        bucket_interval_minutes: Bucket interval in minutes

    Returns:
        Expected count for the bucket
    """
    buckets_per_day = 1440 // bucket_interval_minutes  # 1440 minutes in a day
    return int(expected_daily_count / buckets_per_day)


def is_flatline(values: np.ndarray, threshold: float = 0.01) -> bool:
    """
    Check if values represent a flatline (no variation)

    Args:
        values: Array of values
        threshold: Maximum standard deviation to consider flatline

    Returns:
        True if flatline detected
    """
    if len(values) < 2:
        return False
    return np.std(values) < threshold


def calculate_flatline_percentage(values: np.ndarray, threshold: float = 0.01) -> float:
    """
    Calculate percentage of consecutive flatline segments

    Args:
        values: Array of values
        threshold: Maximum difference to consider consecutive values as flatline

    Returns:
        Percentage of flatline (0-100)
    """
    if len(values) < 2:
        return 0.0

    # Calculate differences between consecutive values
    diffs = np.abs(np.diff(values))

    # Count how many differences are below threshold
    flatline_count = np.sum(diffs < threshold)

    # Calculate percentage
    flatline_pct = (flatline_count / len(diffs)) * 100

    return flatline_pct


def detect_outliers_zscore(values: np.ndarray, threshold: float = 3.0) -> np.ndarray:
    """
    Detect outliers using Z-score method

    Args:
        values: Array of values
        threshold: Z-score threshold

    Returns:
        Boolean array indicating outliers
    """
    if len(values) < 3:
        return np.zeros(len(values), dtype=bool)

    mean = np.mean(values)
    std = np.std(values)

    if std == 0:
        return np.zeros(len(values), dtype=bool)

    z_scores = np.abs((values - mean) / std)
    return z_scores > threshold


def detect_outliers_iqr(values: np.ndarray, multiplier: float = 1.5) -> np.ndarray:
    """
    Detect outliers using IQR method

    Args:
        values: Array of values
        multiplier: IQR multiplier for outlier bounds

    Returns:
        Boolean array indicating outliers
    """
    if len(values) < 4:
        return np.zeros(len(values), dtype=bool)

    q1 = np.percentile(values, 25)
    q3 = np.percentile(values, 75)
    iqr = q3 - q1

    lower_bound = q1 - multiplier * iqr
    upper_bound = q3 + multiplier * iqr

    return (values < lower_bound) | (values > upper_bound)


def safe_divide(numerator: float, denominator: float, default: float = 0.0) -> float:
    """
    Safely divide two numbers, returning default if denominator is zero

    Args:
        numerator: Numerator
        denominator: Denominator
        default: Default value if division fails

    Returns:
        Result of division or default value
    """
    if denominator == 0 or np.isnan(denominator) or np.isnan(numerator):
        return default
    return numerator / denominator


def normalize_value(value: float, min_val: float, max_val: float) -> float:
    """
    Normalize value to [0, 1] range

    Args:
        value: Value to normalize
        min_val: Minimum value in range
        max_val: Maximum value in range

    Returns:
        Normalized value
    """
    if max_val == min_val:
        return 0.5
    return (value - min_val) / (max_val - min_val)


def batch_list(items: List[Any], batch_size: int) -> List[List[Any]]:
    """
    Split list into batches

    Args:
        items: List of items
        batch_size: Size of each batch

    Returns:
        List of batches
    """
    return [items[i:i + batch_size] for i in range(0, len(items), batch_size)]


def merge_dicts(dict1: Dict, dict2: Dict) -> Dict:
    """
    Merge two dictionaries recursively

    Args:
        dict1: First dictionary
        dict2: Second dictionary (takes precedence)

    Returns:
        Merged dictionary
    """
    result = dict1.copy()
    for key, value in dict2.items():
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = merge_dicts(result[key], value)
        else:
            result[key] = value
    return result


def format_duration(seconds: float) -> str:
    """
    Format duration in seconds to human-readable string

    Args:
        seconds: Duration in seconds

    Returns:
        Formatted string (e.g., "2m 30s", "1h 15m 30s")
    """
    if seconds < 60:
        return f"{seconds:.1f}s"
    elif seconds < 3600:
        minutes = int(seconds // 60)
        secs = seconds % 60
        return f"{minutes}m {secs:.0f}s"
    else:
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = seconds % 60
        return f"{hours}h {minutes}m {secs:.0f}s"


def get_bucket_history_range(
    year: int,
    day_number: int,
    time_bucket_no: int,
    history_days: int = 7,
    bucket_interval_minutes: int = 15
) -> List[Tuple[int, int, int]]:
    """
    Get list of bucket coordinates for historical comparison

    Args:
        year: Current year
        day_number: Current day number
        time_bucket_no: Current bucket number
        history_days: Number of days to look back
        bucket_interval_minutes: Bucket interval in minutes

    Returns:
        List of (year, day_number, time_bucket_no) tuples
    """
    # Get current bucket datetime
    current_dt, _ = get_bucket_datetime_range(
        year, day_number, time_bucket_no, bucket_interval_minutes
    )

    # Generate historical buckets
    buckets = []
    for day_offset in range(1, history_days + 1):
        hist_dt = current_dt - timedelta(days=day_offset)
        hist_bucket = get_time_bucket_info(hist_dt, bucket_interval_minutes)
        buckets.append(hist_bucket)

    return buckets


def validate_dataframe_columns(df: pd.DataFrame, required_columns: List[str]) -> bool:
    """
    Validate that DataFrame contains required columns

    Args:
        df: DataFrame to validate
        required_columns: List of required column names

    Returns:
        True if all columns present

    Raises:
        ValueError if columns are missing
    """
    missing = set(required_columns) - set(df.columns)
    if missing:
        raise ValueError(f"DataFrame missing required columns: {missing}")
    return True
