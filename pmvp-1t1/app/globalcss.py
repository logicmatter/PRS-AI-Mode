def inject_global_css():
    from nicegui import ui

    ui.add_head_html('''
    <style>
        :root {
            --color-bg-light: #ffffff;
            --color-bg-dark: #1e1e1e;
            --color-fg-light: #1e1e1e;
            --color-fg-dark: #f1f1f1;
            --color-sidebar-light: #f5f5f5;
            --color-sidebar-dark: #2c2c2c;
            --color-sidebar-hover-light: #e2e2e2;
            --color-sidebar-hover-dark: #3a3a3a;
        }

        html {
            background-color: var(--color-bg-light);
            color: var(--color-fg-light);
        }

        html.dark {
            background-color: var(--color-bg-dark);
            color: var(--color-fg-dark);
        }

        .bg-background {
            background-color: var(--color-bg-light);
        }

        html.dark .bg-background {
            background-color: var(--color-bg-dark);
        }

        .bg-sidebar {
            background-color: var(--color-sidebar-light);
        }

        html.dark .bg-sidebar {
            background-color: var(--color-sidebar-dark);
        }

        .text-foreground {
            color: var(--color-fg-light);
        }

        html.dark .text-foreground {
            color: var(--color-fg-dark);
        }

        .hover\\:bg-sidebar-hover:hover {
            background-color: var(--color-sidebar-hover-light);
        }

        html.dark .hover\\:bg-sidebar-hover:hover {
            background-color: var(--color-sidebar-hover-dark);
        }
    </style>
    ''')
