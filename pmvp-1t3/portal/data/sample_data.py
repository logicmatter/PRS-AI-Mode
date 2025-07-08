from datetime import datetime, timedelta, time, date
import pandas as pd
import numpy as np

def generate_temperature_data():
    start_dt = datetime.combine(date.today() - timedelta(days=7), time(0, 0))
    end_dt = datetime.combine(date.today(), time(23, 0))
    dt_index = pd.date_range(start=start_dt, end=end_dt, freq='H')
    temp = 20 + 5 * np.sin(np.linspace(0, 3.14 * 4, len(dt_index))) + np.random.normal(0, 0.5, len(dt_index))
    return pd.DataFrame({"datetime": dt_index, "temperature": temp})
