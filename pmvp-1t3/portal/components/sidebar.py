from dash import html
import dash_bootstrap_components as dbc

class LeftMenu:
    def __init__(self):
        self.apps = [
            {"id": "trend", "name": "TrendApp"},
            # can add more apps here
        ]

    def layout(self):
        return html.Div(
            [
                html.H5("Apps", style={"padding": "10px", "borderBottom": "1px solid #ddd"}),
                dbc.Nav(
                    [
                        dbc.NavLink(
                            app["name"], href="#", id={"type": "app-link", "index": app["id"]}, active=(i == 0)
                        ) for i, app in enumerate(self.apps)
                    ],
                    vertical=True,
                    pills=True,
                    style={"padding": "10px"},
                ),
            ],
            style={
                "width": "180px",
                "backgroundColor": "#f8f9fa",
                "borderRight": "1px solid #ddd",
                "height": "100vh",
                "position": "fixed",
                "top": 56,
                "left": 0,
                "overflowY": "auto",
            },
        )
