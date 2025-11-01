#!/usr/bin/env python3
"""
Flattened Codebase Analysis Tool

This script analyzes the flattened-codebase.xml file and generates comprehensive
statistics and insights about the Angular application codebase.
"""

import xml.etree.ElementTree as ET
import os
import re
import json
from collections import defaultdict, Counter
from pathlib import Path
from typing import Dict, List, Tuple


class CodebaseAnalyzer:
    """Analyzes a flattened XML codebase"""
    
    def __init__(self, xml_path: str):
        self.xml_path = xml_path
        self.tree = None
        self.root = None
        self.files = []
        self.stats = {
            'total_files': 0,
            'total_lines': 0,
            'total_size': 0,
            'file_types': Counter(),
            'components': [],
            'services': [],
            'modules': [],
            'pipes': [],
            'directives': [],
            'guards': [],
            'models': [],
            'projects': set(),
            'dependencies': {},
            'angular_features': defaultdict(int)
        }
        
    def load_xml(self):
        """Load and parse the XML file"""
        print(f"Loading XML file: {self.xml_path}")
        self.tree = ET.parse(self.xml_path)
        self.root = self.tree.getroot()
        print("XML loaded successfully")
        
    def extract_files(self):
        """Extract all files from the XML"""
        print("Extracting files from XML...")
        for file_elem in self.root.findall('file'):
            path = file_elem.get('path')
            # Get content from CDATA section
            content = file_elem.text or ''
            
            self.files.append({
                'path': path,
                'content': content,
                'size': len(content.encode('utf-8')),
                'lines': len(content.split('\n')) if content else 0
            })
        
        self.stats['total_files'] = len(self.files)
        print(f"Extracted {self.stats['total_files']} files")
        
    def analyze_file_types(self):
        """Analyze file types and extensions"""
        print("Analyzing file types...")
        for file in self.files:
            path = file['path']
            # Normalize path separators
            path = path.replace('\\', '/')
            
            # Get extension
            if '.' in os.path.basename(path):
                ext = os.path.splitext(path)[1].lower()
                self.stats['file_types'][ext] += 1
            else:
                self.stats['file_types']['[no extension]'] += 1
            
            # Update totals
            self.stats['total_lines'] += file['lines']
            self.stats['total_size'] += file['size']
    
    def extract_project_name(self, path: str) -> str:
        """Extract Angular project name from path
        
        Args:
            path: File path (may contain backslash or forward slash separators)
            
        Returns:
            Project name or empty string if not in a project
        """
        # Normalize path separators
        normalized_path = path.replace('\\', '/')
        
        # Check if path starts with projects/ or contains /projects/
        if normalized_path.startswith('projects/'):
            parts = normalized_path.split('/')
            if len(parts) > 1:
                return parts[1]
        elif '/projects/' in normalized_path:
            parts = normalized_path.split('/projects/')[1].split('/')
            if parts:
                return parts[0]
        
        return ''
    
    def analyze_angular_structure(self):
        """Analyze Angular-specific structure"""
        print("Analyzing Angular structure...")
        
        for file in self.files:
            path = file['path'].replace('\\', '/')
            content = file['content']
            basename = os.path.basename(path)
            
            # Extract project name
            project = self.extract_project_name(file['path'])
            if project:
                self.stats['projects'].add(project)
            
            # Identify Angular artifacts by naming convention
            if path.endswith('.component.ts') and '.spec.' not in path:
                self.stats['components'].append(path)
                self.stats['angular_features']['components'] += 1
                
            elif path.endswith('.service.ts') and '.spec.' not in path:
                self.stats['services'].append(path)
                self.stats['angular_features']['services'] += 1
                
            elif path.endswith('.module.ts') and '.spec.' not in path:
                self.stats['modules'].append(path)
                self.stats['angular_features']['modules'] += 1
                
            elif path.endswith('.pipe.ts') and '.spec.' not in path:
                self.stats['pipes'].append(path)
                self.stats['angular_features']['pipes'] += 1
                
            elif path.endswith('.directive.ts') and '.spec.' not in path:
                self.stats['directives'].append(path)
                self.stats['angular_features']['directives'] += 1
                
            elif path.endswith('.guard.ts') and '.spec.' not in path:
                self.stats['guards'].append(path)
                self.stats['angular_features']['guards'] += 1
                
            elif path.endswith('.model.ts') or path.endswith('.interface.ts'):
                self.stats['models'].append(path)
                self.stats['angular_features']['models'] += 1
            
            # Count test files
            if '.spec.ts' in path:
                self.stats['angular_features']['test_files'] += 1
            
            # Analyze package.json for dependencies
            if basename == 'package.json':
                try:
                    pkg_data = json.loads(content)
                    if 'dependencies' in pkg_data:
                        self.stats['dependencies'] = pkg_data.get('dependencies', {})
                except json.JSONDecodeError:
                    pass
    
    def analyze_code_patterns(self):
        """Analyze code patterns and features used"""
        print("Analyzing code patterns...")
        
        patterns = {
            'observables': 0,
            'http_calls': 0,
            'forms': 0,
            'routing': 0,
            'lifecycle_hooks': 0,
            'decorators': 0
        }
        
        for file in self.files:
            if file['path'].endswith('.ts'):
                content = file['content']
                
                # Count common patterns
                patterns['observables'] += len(re.findall(r'Observable<', content))
                patterns['http_calls'] += len(re.findall(r'http\.(get|post|put|delete|patch)', content, re.IGNORECASE))
                patterns['forms'] += len(re.findall(r'FormGroup|FormControl|FormBuilder', content))
                patterns['routing'] += len(re.findall(r'Router|RouterModule|Routes', content))
                patterns['lifecycle_hooks'] += len(re.findall(r'ngOnInit|ngOnDestroy|ngOnChanges|ngAfterViewInit', content))
                patterns['decorators'] += len(re.findall(r'@(Component|Injectable|Directive|Pipe|NgModule|Input|Output)', content))
        
        self.stats['code_patterns'] = patterns
    
    def generate_report(self, output_path: str = None):
        """Generate a comprehensive analysis report"""
        print("\nGenerating analysis report...")
        
        report_lines = []
        report_lines.append("=" * 80)
        report_lines.append("FLATTENED CODEBASE ANALYSIS REPORT")
        report_lines.append("=" * 80)
        report_lines.append("")
        
        # Overview
        report_lines.append("## OVERVIEW")
        report_lines.append("-" * 80)
        report_lines.append(f"Total Files:        {self.stats['total_files']:,}")
        report_lines.append(f"Total Lines:        {self.stats['total_lines']:,}")
        report_lines.append(f"Total Size:         {self.stats['total_size']:,} bytes ({self.stats['total_size'] / 1024 / 1024:.2f} MB)")
        report_lines.append(f"Angular Projects:   {len(self.stats['projects'])}")
        report_lines.append("")
        
        # File Types Distribution
        report_lines.append("## FILE TYPES DISTRIBUTION")
        report_lines.append("-" * 80)
        sorted_types = sorted(self.stats['file_types'].items(), key=lambda x: x[1], reverse=True)
        for ext, count in sorted_types[:15]:
            percentage = (count / self.stats['total_files']) * 100
            report_lines.append(f"{ext:20s} {count:6d} files ({percentage:5.1f}%)")
        report_lines.append("")
        
        # Angular Structure
        report_lines.append("## ANGULAR STRUCTURE")
        report_lines.append("-" * 80)
        report_lines.append(f"Components:         {len(self.stats['components'])}")
        report_lines.append(f"Services:           {len(self.stats['services'])}")
        report_lines.append(f"Modules:            {len(self.stats['modules'])}")
        report_lines.append(f"Pipes:              {len(self.stats['pipes'])}")
        report_lines.append(f"Directives:         {len(self.stats['directives'])}")
        report_lines.append(f"Guards:             {len(self.stats['guards'])}")
        report_lines.append(f"Models/Interfaces:  {len(self.stats['models'])}")
        report_lines.append(f"Test Files:         {self.stats['angular_features']['test_files']}")
        report_lines.append("")
        
        # Projects
        if self.stats['projects']:
            report_lines.append("## ANGULAR PROJECTS")
            report_lines.append("-" * 80)
            for project in sorted(self.stats['projects']):
                report_lines.append(f"  • {project}")
            report_lines.append("")
        
        # Code Patterns
        if 'code_patterns' in self.stats:
            report_lines.append("## CODE PATTERNS & FEATURES")
            report_lines.append("-" * 80)
            patterns = self.stats['code_patterns']
            report_lines.append(f"RxJS Observables:   {patterns['observables']} occurrences")
            report_lines.append(f"HTTP Calls:         {patterns['http_calls']} occurrences")
            report_lines.append(f"Forms Usage:        {patterns['forms']} occurrences")
            report_lines.append(f"Routing:            {patterns['routing']} occurrences")
            report_lines.append(f"Lifecycle Hooks:    {patterns['lifecycle_hooks']} occurrences")
            report_lines.append(f"Decorators:         {patterns['decorators']} occurrences")
            report_lines.append("")
        
        # Dependencies
        if self.stats['dependencies']:
            report_lines.append("## KEY DEPENDENCIES")
            report_lines.append("-" * 80)
            # Show main Angular and popular dependencies
            key_deps = ['@angular/core', '@angular/common', '@angular/router', 
                       '@angular/forms', '@angular/material', 'rxjs', 'typescript']
            for dep in key_deps:
                if dep in self.stats['dependencies']:
                    report_lines.append(f"  {dep:30s} {self.stats['dependencies'][dep]}")
            report_lines.append("")
        
        # Top Components by Size
        report_lines.append("## TOP 10 LARGEST FILES")
        report_lines.append("-" * 80)
        largest_files = sorted(self.files, key=lambda x: x['size'], reverse=True)[:10]
        for f in largest_files:
            size_kb = f['size'] / 1024
            report_lines.append(f"  {size_kb:7.1f} KB - {f['path']}")
        report_lines.append("")
        
        # Summary
        report_lines.append("## SUMMARY")
        report_lines.append("-" * 80)
        report_lines.append("This Angular application consists of multiple projects organized in a")
        report_lines.append("monorepo structure. The codebase demonstrates modern Angular practices")
        report_lines.append("with extensive use of components, services, and reactive programming")
        report_lines.append("patterns using RxJS.")
        report_lines.append("")
        
        avg_file_size = self.stats['total_size'] / self.stats['total_files'] if self.stats['total_files'] > 0 else 0
        avg_lines_per_file = self.stats['total_lines'] / self.stats['total_files'] if self.stats['total_files'] > 0 else 0
        
        report_lines.append(f"Average file size:    {avg_file_size:,.0f} bytes")
        report_lines.append(f"Average lines/file:   {avg_lines_per_file:,.0f} lines")
        report_lines.append("")
        report_lines.append("=" * 80)
        
        report_text = "\n".join(report_lines)
        
        # Print to console
        print("\n" + report_text)
        
        # Save to file if path provided
        if output_path:
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(report_text)
            print(f"\nReport saved to: {output_path}")
        
        return report_text
    
    def generate_json_report(self, output_path: str):
        """Generate a JSON report with detailed statistics"""
        report_data = {
            'overview': {
                'total_files': self.stats['total_files'],
                'total_lines': self.stats['total_lines'],
                'total_size_bytes': self.stats['total_size'],
                'total_size_mb': round(self.stats['total_size'] / 1024 / 1024, 2),
                'angular_projects_count': len(self.stats['projects'])
            },
            'file_types': dict(self.stats['file_types']),
            'angular_structure': {
                'components': len(self.stats['components']),
                'services': len(self.stats['services']),
                'modules': len(self.stats['modules']),
                'pipes': len(self.stats['pipes']),
                'directives': len(self.stats['directives']),
                'guards': len(self.stats['guards']),
                'models': len(self.stats['models']),
                'test_files': self.stats['angular_features']['test_files']
            },
            'projects': sorted(list(self.stats['projects'])),
            'code_patterns': self.stats.get('code_patterns', {}),
            'dependencies': self.stats['dependencies'],
            'top_files_by_size': [
                {
                    'path': f['path'],
                    'size_bytes': f['size'],
                    'size_kb': round(f['size'] / 1024, 1),
                    'lines': f['lines']
                }
                for f in sorted(self.files, key=lambda x: x['size'], reverse=True)[:20]
            ]
        }
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(report_data, f, indent=2)
        
        print(f"JSON report saved to: {output_path}")
        return report_data
    
    def analyze(self, output_path: str = None, json_output_path: str = None):
        """Run complete analysis"""
        self.load_xml()
        self.extract_files()
        self.analyze_file_types()
        self.analyze_angular_structure()
        self.analyze_code_patterns()
        
        text_report = self.generate_report(output_path)
        
        if json_output_path:
            self.generate_json_report(json_output_path)
        
        return text_report


def main():
    """Main entry point
    
    Returns:
        int: Exit code (0 for success, 1 for error)
    """
    # Path to the flattened codebase XML
    xml_path = os.path.join(
        os.path.dirname(__file__),
        'portal', 'PMPortal', 'PmApps', 'flattened-codebase.xml'
    )
    
    if not os.path.exists(xml_path):
        print(f"Error: XML file not found at {xml_path}")
        return 1
    
    # Output paths for the reports
    output_path = os.path.join(
        os.path.dirname(__file__),
        'CODEBASE_ANALYSIS_REPORT.txt'
    )
    
    json_output_path = os.path.join(
        os.path.dirname(__file__),
        'CODEBASE_ANALYSIS_REPORT.json'
    )
    
    try:
        # Create analyzer and run analysis
        analyzer = CodebaseAnalyzer(xml_path)
        analyzer.analyze(output_path, json_output_path)
        
        print("\n✅ Analysis complete!")
        return 0
    except Exception as e:
        print(f"\n❌ Analysis failed: {e}")
        return 1


if __name__ == '__main__':
    exit(main())
