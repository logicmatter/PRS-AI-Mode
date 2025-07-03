import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from flask import Flask, render_template, request, jsonify
import logging

# Set up logging for debugging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create Flask app
app = Flask(__name__)

# Generate random data function
def generate_data(start: datetime, end: datetime) -> pd.DataFrame:
    try:
        index = pd.date_range(start=start, end=end, freq='1min')
        values = np.random.normal(loc=50, scale=10, size=len(index))
        return pd.DataFrame({'datetime': index, 'value': values})
    except Exception as e:
        logger.error(f"Error generating data: {str(e)}")
        return pd.DataFrame()

@app.route('/')
def index():
    try:
        logger.info("Rendering main page")
        now = datetime.now()
        default_start = (now - timedelta(hours=1)).strftime('%Y-%m-%dT%H:%M')
        default_end = now.strftime('%Y-%m-%dT%H:%M')
        return render_template('index.html', start=default_start, end=default_end)
    except Exception as e:
        logger.error(f"Error rendering page: {str(e)}")
        return render_template('index.html', error=str(e))

@app.route('/update', methods=['POST'])
def update():
    try:
        start_str = request.form.get('from_date')
        end_str = request.form.get('to_date')
        
        if not start_str or not end_str:
            return jsonify({'error': 'Please select both start and end dates'}), 400
        
        start = datetime.fromisoformat(start_str.replace('T', ' '))
        end = datetime.fromisoformat(end_str.replace('T', ' '))
        
        if start >= end:
            return jsonify({'error': 'Start date must be before end date'}), 400

        df = generate_data(start, end)
        if df.empty:
            return jsonify({'error': 'No data for selected range'}), 400

        min_val = df['value'].min()
        max_val = df['value'].max()
        mean_val = df['value'].mean()

        data = {
            'min': round(min_val, 2),
            'mean': round(mean_val, 2),
            'max': round(max_val, 2),
            'labels': df['datetime'].dt.strftime('%Y-%m-%d %H:%M:%S').tolist(),
            'values': df['value'].round(2).tolist()
        }
        return jsonify(data)
    except Exception as e:
        logger.error(f"Error updating dashboard: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Run app
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)