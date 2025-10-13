# PyBMAD Architecture-First Method: Using PMMetrics App Analogy

## The Perfect Analogy: PMMetrics ↔ Particle Accelerator

Your PMMetrics app and a particle accelerator have surprisingly similar architectures!

| PMMetrics App | Particle Accelerator |
|---------------|---------------------|
| **Raw timeseries data** | **Raw particle beam** |
| **15-minute statistical buckets** | **Beam focusing/steering stages** |
| **Backend service queries devices** | **Lattice elements process particles** |
| **Frontend displays processed metrics** | **Diagnostics show beam parameters** |
| **Bootstrap 5 + Jinja2 templates** | **Python + BMAD visualization** |

## Step-by-Step: Architecture-First Method

### Step 1: Define Your System Architecture (Like PMMetrics System Design)

Just like you first designed PMMetrics before coding, we define the accelerator architecture first.

#### PMMetrics Architecture:
```python
# PMMetrics system architecture
class PMMetricsArchitecture:
    def __init__(self):
        self.components = {
            'data_sources': ['Device1', 'Device2', 'Device3'],
            'backend_service': 'Flask API',
            'data_processing': '15min statistical buckets',
            'frontend': 'Bootstrap 5 + Jinja2',
            'database': 'TimeSeries DB'
        }
```

#### Accelerator Architecture (Same Concept):
```python
# Accelerator system architecture
class AcceleratorArchitecture:
    def __init__(self):
        self.components = {
            'beam_source': 'Electron gun',
            'acceleration_stages': ['RF Cavity 1', 'RF Cavity 2'],
            'beam_processing': 'Focusing and steering magnets',
            'diagnostics': 'Beam position monitors',
            'control_system': 'Python + BMAD'
        }
```

### Step 2: Build Backend Service Components (Device Handlers ↔ Lattice Elements)

#### Your PMMetrics Backend Service:
```python
# PMMetrics backend - handles different device types
class DeviceHandler:
    def __init__(self, device_type):
        self.device_type = device_type
        
    def query_raw_data(self):
        """Query device for raw timeseries data"""
        pass
        
    def process_to_15min_buckets(self, raw_data):
        """Convert raw data to 15-minute statistical buckets"""
        pass

class MetricsProcessor:
    def __init__(self):
        self.devices = []
        
    def add_device(self, device):
        """Add a device to monitor"""
        self.devices.append(device)
        
    def process_all_devices(self):
        """Process data from all devices"""
        for device in self.devices:
            raw_data = device.query_raw_data()
            metrics = device.process_to_15min_buckets(raw_data)
```

#### BMAD Equivalent - Lattice Element Handlers:
```python
# BMAD backend - handles different accelerator components
class LatticeElementHandler:
    def __init__(self, element_type):
        self.element_type = element_type
        
    def configure_element(self):
        """Configure accelerator element parameters"""
        pass
        
    def process_beam(self, beam_data):
        """Process beam through this element"""
        pass

class AcceleratorProcessor:
    def __init__(self):
        self.elements = []
        
    def add_element(self, element):
        """Add an element to the beamline"""
        self.elements.append(element)
        
    def track_beam_through_all(self):
        """Track beam through all elements"""
        for element in self.elements:
            beam_state = element.process_beam(current_beam)
```

### Step 3: Create Configuration System (Like Your App Config)

#### PMMetrics Configuration:
```python
# config/pmmetrics_config.py
class PMMetricsConfig:
    def __init__(self):
        self.data_sources = {
            'device_1': {
                'ip': '192.168.1.100',
                'port': 502,
                'points': ['temp', 'pressure', 'flow'],
                'sample_rate': '1min'
            },
            'device_2': {
                'ip': '192.168.1.101', 
                'port': 502,
                'points': ['voltage', 'current', 'power'],
                'sample_rate': '30sec'
            }
        }
        
        self.processing = {
            'bucket_size': '15min',
            'statistics': ['mean', 'max', 'min', 'std'],
            'retention': '30days'
        }
        
        self.frontend = {
            'framework': 'Bootstrap 5',
            'template_engine': 'Jinja2',
            'refresh_rate': '5min'
        }
```

#### BMAD Configuration (Same Pattern):
```python
# config/accelerator_config.py
class AcceleratorConfig:
    def __init__(self):
        self.beam_source = {
            'type': 'electron_gun',
            'energy': '1 MeV',
            'current': '10 mA',
            'emittance': '1 mm-mrad'
        }
        
        self.acceleration_stages = {
            'rf_cavity_1': {
                'frequency': '2.856 GHz',
                'voltage': '50 MV',
                'length': '2.0 m'
            },
            'rf_cavity_2': {
                'frequency': '2.856 GHz', 
                'voltage': '50 MV',
                'length': '2.0 m'
            }
        }
        
        self.diagnostics = {
            'framework': 'Matplotlib',
            'template_system': 'Python scripts',
            'update_rate': '1Hz'
        }
```

### Step 4: Build the Main Application (Your Flask App ↔ BMAD Simulator)

#### Your PMMetrics Flask App:
```python
# app.py - Main PMMetrics application
from flask import Flask, render_template, jsonify
from config.pmmetrics_config import PMMetricsConfig
from backend.device_handler import DeviceHandler
from backend.metrics_processor import MetricsProcessor

app = Flask(__name__)

class PMMetricsApp:
    def __init__(self):
        self.config = PMMetricsConfig()
        self.processor = MetricsProcessor()
        self.setup_devices()
        
    def setup_devices(self):
        """Initialize all device handlers"""
        for device_name, device_config in self.config.data_sources.items():
            device = DeviceHandler(device_config)
            self.processor.add_device(device)
    
    @app.route('/')
    def dashboard(self):
        """Main dashboard - like your Bootstrap 5 + Jinja2 frontend"""
        metrics = self.processor.get_latest_metrics()
        return render_template('dashboard.html', metrics=metrics)
    
    @app.route('/api/metrics')
    def api_metrics(self):
        """API endpoint for real-time data"""
        return jsonify(self.processor.get_current_15min_buckets())

# Run the app
if __name__ == '__main__':
    pmmetrics = PMMetricsApp()
    app.run(debug=True)
```

#### BMAD Simulator (Same Structure):
```python
# simulator.py - Main BMAD application
import bmad
import matplotlib.pyplot as plt
from config.accelerator_config import AcceleratorConfig
from backend.lattice_handler import LatticeElementHandler
from backend.beam_processor import BeamProcessor

class AcceleratorSimulator:
    def __init__(self):
        self.config = AcceleratorConfig()
        self.processor = BeamProcessor()
        self.setup_lattice()
        
    def setup_lattice(self):
        """Initialize all lattice elements"""
        for element_name, element_config in self.config.acceleration_stages.items():
            element = LatticeElementHandler(element_config)
            self.processor.add_element(element)
    
    def run_dashboard(self):
        """Main dashboard - like your Bootstrap frontend but for beam optics"""
        beam_metrics = self.processor.get_latest_beam_parameters()
        self.plot_beam_optics(beam_metrics)
        
    def get_api_data(self):
        """API equivalent - current beam parameters"""
        return self.processor.get_current_beam_state()

# Run the simulator
if __name__ == '__main__':
    accelerator = AcceleratorSimulator()
    accelerator.run_dashboard()
```

### Step 5: Frontend Templates (Bootstrap 5 ↔ Matplotlib Visualizations)

#### Your PMMetrics Frontend Template:
```html
<!-- templates/dashboard.html - Your Bootstrap 5 + Jinja2 -->
<!DOCTYPE html>
<html>
<head>
    <title>PMMetrics Dashboard</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="container-fluid">
        <h1>PMMetrics Dashboard</h1>
        
        <div class="row">
            {% for device_name, metrics in metrics.items() %}
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">{{ device_name }}</div>
                    <div class="card-body">
                        <h5>15-Minute Statistics</h5>
                        <p>Mean: {{ metrics.mean }}</p>
                        <p>Max: {{ metrics.max }}</p>
                        <p>Min: {{ metrics.min }}</p>
                        <!-- Chart would go here -->
                    </div>
                </div>
            </div>
            {% endfor %}
        </div>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
```

#### BMAD Visualization (Same Concept):
```python
# visualization.py - BMAD equivalent of your Bootstrap frontend
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle

class AcceleratorDashboard:
    def __init__(self, beam_data):
        self.beam_data = beam_data
        
    def create_dashboard(self):
        """Create visual dashboard - like your Bootstrap layout"""
        fig, axes = plt.subplots(2, 2, figsize=(15, 10))
        
        # Top left: Beam optics (like your device metrics)
        axes[0,0].plot(self.beam_data['s'], self.beam_data['beta_x'], 'b-', label='βx')
        axes[0,0].plot(self.beam_data['s'], self.beam_data['beta_y'], 'r-', label='βy')
        axes[0,0].set_title('Beam Optics (like Device 1 metrics)')
        axes[0,0].legend()
        
        # Top right: Energy profile (like your 15-min buckets)
        axes[0,1].plot(self.beam_data['s'], self.beam_data['energy'])
        axes[0,1].set_title('Energy Profile (like statistical buckets)')
        
        # Bottom left: Lattice layout (like your device status)
        self.draw_lattice_layout(axes[1,0])
        axes[1,0].set_title('Accelerator Layout (like device locations)')
        
        # Bottom right: Current status (like real-time metrics)
        self.show_current_parameters(axes[1,1])
        axes[1,1].set_title('Current Parameters (like live metrics)')
        
        plt.tight_layout()
        plt.show()
        
    def draw_lattice_layout(self, ax):
        """Draw accelerator components - like showing device status"""
        components = [
            {'name': 'Gun', 'start': 0, 'length': 0.5, 'color': 'red'},
            {'name': 'RF1', 'start': 0.5, 'length': 2.0, 'color': 'blue'},
            {'name': 'Quad', 'start': 2.5, 'length': 0.5, 'color': 'green'},
            {'name': 'RF2', 'start': 3.0, 'length': 2.0, 'color': 'blue'}
        ]
        
        for comp in components:
            rect = Rectangle((comp['start'], -0.5), comp['length'], 1.0,
                           facecolor=comp['color'], alpha=0.7)
            ax.add_patch(rect)
            ax.text(comp['start'] + comp['length']/2, 0, comp['name'],
                   ha='center', va='center')
```

## The Key Insight: Same Architectural Pattern!

### PMMetrics Flow:
1. **Raw Data** (from devices) → **Processing** (15-min buckets) → **Frontend** (Bootstrap dashboard)

### BMAD Flow:  
1. **Raw Beam** (from source) → **Processing** (lattice elements) → **Frontend** (visualization dashboard)

### Both Use:
- **Configuration-driven architecture**
- **Modular backend services** 
- **API-style data flow**
- **Visual frontend dashboards**
- **Real-time monitoring capabilities**

## Step-by-Step Commands (Just Like Setting Up PMMetrics)

### Day 1: Setup (Like Setting Up Your Flask App)
```bash
# Install dependencies (like pip install flask)
pip install matplotlib numpy scipy

# Create project structure (like your Flask project)
mkdir accelerator_project
cd accelerator_project
mkdir config backend templates static
```

### Day 2: Build Configuration (Like Your App Config)
```bash
# Create config files (like your PMMetrics config)
python config/accelerator_config.py  # Test configuration
```

### Day 3: Build Backend (Like Your Device Handlers)
```bash  
# Create backend services (like your device query services)
python backend/lattice_handler.py    # Test lattice elements
python backend/beam_processor.py     # Test beam processing
```

### Day 4: Create Frontend (Like Your Bootstrap Dashboard)
```bash
# Create visualization (like your Jinja2 templates)
python visualization.py              # Test dashboard
```

### Day 5: Run Complete System (Like Running Your Flask App)
```bash
# Run the complete simulator (like flask run)
python simulator.py                  # Complete accelerator simulation
```

## The Beautiful Part: You Already Know This Pattern!

Since you built PMMetrics with:
- **Flask backend** handling device queries
- **Bootstrap 5 + Jinja2** for frontend
- **15-minute statistical processing**

You can easily understand BMAD with:
- **Python backend** handling lattice elements  
- **Matplotlib + Python** for visualization
- **Beam parameter processing**

The architecture is identical - you're just processing particles instead of device metrics!

## Next Steps

1. **Start with the config** (like you did with PMMetrics)
2. **Build one backend handler** (like one device type)
3. **Create simple visualization** (like one Bootstrap card)
4. **Add more components incrementally** (like adding more devices)

The architecture-first approach works the same way for both systems!