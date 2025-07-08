from dash import Dash, html, Input, Output, ctx
import dash_bootstrap_components as dbc
from components.navbar import TopNavMenu
from components.sidebar import LeftMenu
from components.parameterbar import ParameterBar
from components.canvasbar import CanvasBar

# Instantiate app and components
app = Dash(__name__, external_stylesheets=[dbc.themes.BOOTSTRAP])
top_nav = TopNavMenu()
left_menu = LeftMenu()
parameter_bar = ParameterBar()
canvas = CanvasBar()

# Main layout
app.layout = dbc.Container(
    [
        top_nav.layout(),
        html.Div(
            [
                left_menu.layout(),
                html.Div(id="canvas-bar", style={"marginLeft": "180px", "padding": "10px"}),
            ],
            style={"display": "flex", "marginTop": "56px"},
        ),
        html.Div(parameter_bar.layout(), style={"display": "none"}),  # hidden for now
    ],
    fluid=True,
)

# Unified callback to render report based on which input triggered it
@app.callback(
    Output("canvas-bar", "children"),
    [
        Input({"type": "app-link", "index": "trend"}, "n_clicks"),
        Input("canvas-bar", "id"),  # Used to show default report on load
    ],
    prevent_initial_call=False,
)
def load_report(trend_click, _):
    triggered = ctx.triggered_id

    if triggered == {"type": "app-link", "index": "trend"}:
        return canvas.render_report("trend", "trend_report_001")

    # Fallback/default: show trend report initially
    return canvas.render_report("trend", "trend_report_001")


if __name__ == "__main__":
    app.run(debug=True)
    