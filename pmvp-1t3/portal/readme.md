# Dash App

This is a modular Dash application that displays a temperature trend chart based on user-selected date and time ranges. The project uses an object-oriented design to separate UI components, reports, and app logic for easy maintenance and extensibility.

---

## Features

- **Top Navigation Bar** with date range picker and start/end time inputs
- **Left Sidebar Menu** listing available apps (currently only a Trend Report)
- **Canvas Area** rendering interactive Plotly charts
- **Modular structure** allowing easy addition of new reports and components
- **Custom CSS styling** via the `assets/style.css` file
- **Sample synthetic temperature data** simulating a 7-day hourly temperature trend

---

## Project Structure

dash_trend_app/
├── app.py # Main app launcher and callback registration
├── components/ # UI components (navbar, sidebar, parameter bar, canvas)
│ ├── navbar.py
│ ├── sidebar.py
│ ├── parameterbar.py
│ └── canvasbar.py
├── reports/ # Report components
│ └── trend_report.py # Trend report with temperature chart
├── assets/ # Static assets (stylesheets)
│ └── style.css
└── data/ # (Optional) data generation utilities
└── sample_data.py

yaml
Copy
Edit

---

## Requirements

- Python 3.7+
- Dash
- Dash Bootstrap Components
- Pandas
- Plotly

Install dependencies with:

```
pip install dash dash-bootstrap-components pandas plotly
```

Running the App
Run the app locally by executing:
```
python app.py
```

Then open your browser and visit:

cpp
Copy
Edit
http://127.0.0.1:8050
Usage
Select a start and end date using the date picker in the top navigation bar.

Specify start and end times using the time input fields.

The temperature trend chart will update automatically based on your selection.

Use the sidebar to navigate between apps (currently only the Trend Report is available).

Extending the App
Add new report classes by extending the pattern in reports/trend_report.py.

Add new apps to the sidebar by modifying components/sidebar.py.

Customize styling by editing or adding CSS rules in assets/style.css.

Implement centralized parameter management by enhancing the ParameterBar component.

License
This project is provided as-is for demonstration purposes.