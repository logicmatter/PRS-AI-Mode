from nicegui import ui
import sys
from app.portal import portal_page

print("Script execution started")
print("Starting NiceGUI application...")

@ui.page('/')
def index_page():
    ui.add_head_html('<link rel="stylesheet" href="/static/global.css">')
    ui.label('Welcome to the PMVP Portal').classes('title')
    ui.link('Go to Portal', '/portal').classes('link')

if __name__ in {"__main__", "__mp_main__"}:
    try:
        print("Attempting to start NiceGUI server on 0.0.0.0:8000")
        ui.run(
            host='0.0.0.0',
            port=8000,
            title='PMVP Portal',
            show=False
        )
    except Exception as e:
        print(f"Failed to start server: {e}")
        sys.exit(1)