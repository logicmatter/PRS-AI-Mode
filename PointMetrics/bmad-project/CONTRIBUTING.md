# Contributing to BMAD

Thank you for your interest in contributing to the Building Monitoring Analytics & Diagnostics project!

## Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/bmad-project.git`
3. Create a virtual environment: `python3 -m venv venv`
4. Activate it: `source venv/bin/activate`
5. Install dependencies: `make install`
6. Create a branch: `git checkout -b feature/your-feature-name`

## Code Standards

- Follow PEP 8 style guide
- Write docstrings for all functions and classes
- Add type hints to function signatures
- Maintain test coverage above 85%
- Format code with `black` and `isort`
- Run linters before committing: `make lint`

## Testing

```bash
# Run all tests
make test

# Run specific test file
pytest tests/unit/test_metrics_compute.py -v

# Run with coverage
pytest --cov=src/iot_metrics_module --cov-report=html
```

## Commit Messages

Use conventional commit format:

- `feat: Add new KPI computation`
- `fix: Correct drift score calculation`
- `docs: Update API documentation`
- `test: Add integration tests for ML pipeline`
- `refactor: Simplify DataLoader class`

## Pull Request Process

1. Update documentation for any new features
2. Add tests for new functionality
3. Ensure all tests pass: `make test`
4. Run code formatters: `make format`
5. Submit PR with clear description of changes
6. Link related issues in PR description

## Questions?

Open an issue or contact the team at dev@example.com
