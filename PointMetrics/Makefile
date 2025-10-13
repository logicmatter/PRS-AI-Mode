# BMAD Project Makefile

.PHONY: help install test lint format clean docker-build docker-up docker-down

help:
	@echo "BMAD Project - Available Commands"
	@echo "=================================="
	@echo "install       - Install dependencies"
	@echo "test          - Run tests with coverage"
	@echo "lint          - Run linters (flake8, mypy)"
	@echo "format        - Format code (black, isort)"
	@echo "clean         - Remove generated files"
	@echo "docker-build  - Build Docker images"
	@echo "docker-up     - Start Docker services"
	@echo "docker-down   - Stop Docker services"
	@echo "run           - Run the application"

install:
	pip install -r requirements.txt
	pip install -e .

test:
	pytest tests/ -v --cov=src/iot_metrics_module --cov-report=html

lint:
	flake8 src/ tests/
	mypy src/

format:
	black src/ tests/
	isort src/ tests/

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} +
	rm -rf build/ dist/ htmlcov/ .coverage .pytest_cache/

docker-build:
	docker-compose build

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

run:
	python src/iot_metrics_module/main.py
