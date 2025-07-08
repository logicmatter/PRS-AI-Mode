from dash import html, dcc
import dash_bootstrap_components as dbc
from datetime import date, timedelta

class ParameterBar:
    def layout(self):
        return html.Div(
            [
                dcc.DatePickerRange(
                    id="param-date-range",
                    start_date=date.today() - timedelta(days=7),
                    end_date=date.today(),
                    display_format="YYYY-MM-DD",
                ),
                dbc.Input(type="time", id="param-start-time", value="00:00", style={"width": "120px", "display": "inline-block", "marginRight": "10px"}),
                dbc.Input(type="time", id="param-end-time", value="23:59", style={"width": "120px", "display": "inline-block"}),
            ],
            style={"padding": "10px", "backgroundColor": "#f8f9fa", "borderBottom": "1px solid #ddd"},
        )
