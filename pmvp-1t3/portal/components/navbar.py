from dash import html, dcc
import dash_bootstrap_components as dbc
from datetime import date, timedelta

class TopNavMenu:
    def layout(self):
        return dbc.Navbar(
            dbc.Container(
                [
                    dbc.Row(
                        [
                            dbc.Col(html.H4("PortalApp", className="text-white"), width="auto"),
                            dbc.Col(
                                dcc.DatePickerRange(
                                    id="nav-date-range",
                                    start_date=date.today() - timedelta(days=7),
                                    end_date=date.today(),
                                    display_format="YYYY-MM-DD",
                                    className="navbar-datepicker"
                                ),
                                width="auto",
                                style={"marginLeft": "20px"}
                            ),
                            dbc.Col(
                                dbc.Input(type="time", id="nav-start-time", value="00:00", className="navbar-time"),
                                width="auto"
                            ),
                            dbc.Col(
                                dbc.Input(type="time", id="nav-end-time", value="23:59", className="navbar-time"),
                                width="auto"
                            ),
                        ],
                        align="center",
                        justify="start",
                        className="g-2"
                    )
                ],
                fluid=True
            ),
            color="dark",
            dark=True,
            fixed="top",
        )

