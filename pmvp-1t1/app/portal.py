from nicegui import ui
from datetime import datetime, timedelta
from app.controller import generate_data
from app.navbar import create_navbar
from app.sidebar import create_sidebar

@ui.page('/portal')
async def portal_page():
    now = datetime.now()
    default_start = (now - timedelta(hours=1)).strftime('%Y-%m-%d %H:%M:%S')
    default_end = now.strftime('%Y-%m-%d %H:%M:%S')

    from_picker = ui.input(label='From', value=default_start).classes('input hidden')
    to_picker = ui.input(label='To', value=default_end).classes('input hidden')

    create_navbar(from_picker, to_picker)

    with ui.row().classes('page-container'):
        create_sidebar()

        with ui.column().classes('content-area'):
            ui.label('📈 Portal Content Area').classes('title')
            ui.button('Update', on_click=lambda: ui.notify('Update clicked')).classes('button')
            ui.label('Trend visualizations and metrics will go here.').classes('label')