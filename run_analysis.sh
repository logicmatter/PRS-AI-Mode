#!/bin/bash

# Flattened Codebase Analysis Runner
# This script runs the analysis and displays the results

set -e

echo "=================================="
echo "Flattened Codebase Analysis Tool"
echo "=================================="
echo ""

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is required but not found."
    echo "Please install Python 3.6 or higher."
    exit 1
fi

# Check if the XML file exists
XML_FILE="portal/PMPortal/PmApps/flattened-codebase.xml"
if [ ! -f "$XML_FILE" ]; then
    echo "Error: Flattened codebase XML not found at $XML_FILE"
    exit 1
fi

echo "Running analysis..."
echo ""

# Run the analysis
python3 analyze_flattened_codebase.py

echo ""
echo "=================================="
echo "Analysis Complete!"
echo "=================================="
echo ""
echo "Generated files:"
echo "  - CODEBASE_ANALYSIS_REPORT.txt (detailed text report)"
echo "  - CODEBASE_ANALYSIS_REPORT.json (JSON data)"
echo ""
echo "Documentation:"
echo "  - ANALYSIS_SUMMARY.md (executive summary)"
echo "  - CODEBASE_ANALYSIS_README.md (full documentation)"
echo ""
echo "To view the summary:"
echo "  cat CODEBASE_ANALYSIS_REPORT.txt"
echo ""
echo "To view key metrics:"
echo "  head -n 30 ANALYSIS_SUMMARY.md"
echo ""
