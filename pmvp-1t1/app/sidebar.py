from nicegui import ui

def create_sidebar():
    with ui.column().props('id=sidebar').classes('sidebar'):
        ui.label('Navigation').classes('title')

        def sidebar_link(url, icon, text):
            with ui.element('a').classes('link'):
                ui.html(icon).classes('icon')
                ui.label(text).classes('sidebar-label')
                ui.element().on('click', lambda: ui.run_javascript(f'window.location.href = "{url}"; history.pushState(null, "", "/");'))

        sidebar_link('/portal', '🏠', 'Home')
        sidebar_link('/reports', '📊', 'Reports')
        sidebar_link('/admin', '👤', 'Admin')
        sidebar_link('/settings', '⚙️', 'Settings')