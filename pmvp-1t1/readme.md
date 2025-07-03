# MVP 1 - T1 (FastAPI+NiceGUI)
This uses neoGui and FastAPI to build apps very quickly.

## Depdenencies
```
pip install fastapi uvicorn nicegui plotly pandas numpy
```
|Package	|Purpose|
|---------|--------|
|fastapi	|Web framework|
|uvicorn	|ASGI server to run FastAPI|
|nicegui|	Frontend UI layer|
|plotly|	Interactive charts|
|pandas|	Time-series and data processing|
|numpy	|Random number generation and array math|

## Components

model.py		: Generates data.
controller.py	: Handles logic and validation.
views.py		: Handles UI rendering and interactions.
main.py			: Initializes and runs the app.


## Installation
- Install libraries
`pip install -r requirements.txt`
-Then to run the program
```
cd pmvp-1t1
python main.py
```

