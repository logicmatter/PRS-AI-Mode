import pandas as pd
import numpy as np
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


def generate_data(start: datetime, end: datetime) -> pd.DataFrame:
    try:
        index = pd.date_range(start=start, end=end, freq='1min')
        values = np.random.normal(loc=50, scale=10, size=len(index))
        return pd.DataFrame({'datetime': index, 'value': values})
    except Exception as e:
        logger.error(f"Error generating data: {str(e)}")
        return pd.DataFrame()
