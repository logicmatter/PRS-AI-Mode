from dash import html, dcc
import plotly.graph_objs as go
import pandas as pd
import numpy as np
from datetime import datetime, timedelta, time, date

class TrendReport:
    def __init__(self, report_id):
        self.report_id = report_id
        self.df = self.generate_sample_data()

    def generate_sample_data(self):
        start_dt = datetime.combine(date.today() - timedelta(days=7), time(0, 0))
        end_dt = datetime.combine(date.today(), time(23, 0))
        dt_index = pd.date_range(start=start_dt, end=end_dt, freq='H')
        temp = 20 + 5 * np.sin(np.linspace(0, 3.14 * 4, len(dt_index))) + np.random.normal(0, 0.5, len(dt_index))
        return pd.DataFrame({"datetime": dt_index, "temperature": temp})

    def render(self):
        fig = go.Figure()
        fig.add_trace(go.Scatter(
            x=self.df['datetime'],
            y=self.df['temperature'],
            mode='lines+markers',
            name='Temperature (°C)',
            line=dict(color='firebrick', width=2),
            marker=dict(size=4)
        ))
        fig.update_layout(
            title=f"Temperature Trend - Report ID: {self.report_id}",
            xaxis_title="Datetime",
            yaxis_title="Temperature (°C)",
            margin=dict(l=40, r=20, t=50, b=40),
            template="plotly_white",
        )

        return html.Div([
            dcc.Graph(figure=fig)
        ])
