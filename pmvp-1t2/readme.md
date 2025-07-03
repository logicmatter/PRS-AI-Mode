# MVP 1 T2 Flask-Based Time Series Dashboard App
This app is a lightweight Flask web application that allows users to select a date/time range and visualize simulated time-series data. It's designed as a minimal dashboard for exploring trends, such as sensor or metric values over time.

🔧 Features
Frontend: HTML-based UI served with Flask templates.

Date Range Selector: User selects start and end datetime values.

Data Generator: Simulates values using numpy's normal distribution.

Data Processing: Uses pandas for time indexing and statistical aggregation.

REST Endpoint: /update accepts POST requests and returns JSON summary data.

Metrics Returned: Minimum, Maximum, and Mean values, plus the full data series.


# Setup and Run
```
your-project/
│
├── app.py                # Your main Flask app
├── requirements.txt
└── templates/
    └── index.html        # HTML file for rendering the dashboard


cd pmvp-1t2
pip install -r requirements.txt

python app.py

```

