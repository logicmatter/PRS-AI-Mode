from nicegui import ui
from datetime import datetime

def create_navbar(from_picker, to_picker):
    with ui.header().classes('navbar'):
        with ui.row().classes('navbar-row'):
            ui.button(icon='menu').props('flat dense').classes('button').on(
                'click', lambda: ui.run_javascript("document.getElementById('sidebar').classList.toggle('hidden')")
            )
            ui.label('PMVP Portal Dashboard').classes('title')

        with ui.row().classes('navbar-row'):
            with ui.row().classes('navbar-row-tight'):
                ui.label('From:').classes('label')
                ui.input(value=from_picker.value.replace(' ', 'T'), on_change=lambda e: from_picker.set_value(e.value.replace('T', ' '))) \
                    .props('type=datetime-local outlined dense').classes('input')

            with ui.row().classes('navbar-row-tight'):
                ui.label('To:').classes('label')
                ui.input(value=to_picker.value.replace(' ', 'T'), on_change=lambda e: to_picker.set_value(e.value.replace('T', ' '))) \
                    .props('type=datetime-local outlined dense').classes('input')

            ui.switch('Dark mode').on(
                'update:model-value',
                lambda e: ui.run_javascript('''
                    document.documentElement.classList.toggle("q-dark");
                    document.querySelectorAll(".navbar, .navbar-row, .navbar-row-tight, .button, .title, .label, .input, .switch, .q-date").forEach(el => {
                        el.style.backgroundColor = "";
                        el.offsetHeight; // Force reflow
                        el.style.backgroundColor = getComputedStyle(el).backgroundColor;
                    });
                    console.log("Dark mode toggled:", document.documentElement.classList.contains("q-dark"));
                ''')
            ).classes('switch')