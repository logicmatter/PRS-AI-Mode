from reports.trend_report import TrendReport
from dash import html

class CanvasBar:
    def render_report(self, app_id, report_id):
        """
        Render the report content based on the selected app ID.
        """
        if app_id == "trend":
            report = TrendReport(report_id)
            return report.render()

        # Future app reports like 'alarm', 'summary' can be added here
        return html.Div(f"No report available for app: {app_id}", style={"padding": "20px", "color": "red"})
