#!/usr/bin/env python3
"""
ALE KIRCHA - COMPLETE ERROR SCANNER
Scans all TypeScript files and provides detailed error reports
"""

import os
import re
import subprocess
from pathlib import Path
from datetime import datetime

# Colors
GREEN = '\033[92m'
YELLOW = '\033[93m'
RED = '\033[91m'
BLUE = '\033[94m'
CYAN = '\033[96m'
PURPLE = '\033[95m'
BOLD = '\033[1m'
NC = '\033[0m'

def print_header(msg):
    print(f"\n{BOLD}{BLUE}{'='*60}{NC}")
    print(f"{BOLD}{BLUE}{msg}{NC}")
    print(f"{BOLD}{BLUE}{'='*60}{NC}")

def print_subheader(msg):
    print(f"\n{CYAN}┃ {msg}{NC}")

def print_error(msg):
    print(f"{RED}❌ {msg}{NC}")

def print_success(msg):
    print(f"{GREEN}✅ {msg}{NC}")

def print_info(msg):
    print(f"{BLUE}ℹ️ {msg}{NC}")

def print_warning(msg):
    print(f"{YELLOW}⚠️ {msg}{NC}")

def get_ts_errors(directory):
    """Run tsc and capture errors"""
    os.chdir(directory)
    result = subprocess.run(['npx', 'tsc', '--noEmit'], 
                           capture_output=True, text=True)
    os.chdir('..')
    return result.stdout + result.stderr

def parse_errors(output):
    """Parse TypeScript errors from output"""
    errors = []
    for line in output.split('\n'):
        # Match pattern: file.ts(line,col): error TSxxxx: message
        match = re.search(r'([^:]+)\((\d+),(\d+)\):\s*error\s+(TS\d+):\s*(.+)', line)
        if match:
            errors.append({
                'file': match.group(1),
                'line': int(match.group(2)),
                'col': int(match.group(3)),
                'code': match.group(4),
                'message': match.group(5)
            })
        else:
            # Check for other error patterns
            match = re.search(r'error\s+(TS\d+):\s*(.+)', line)
            if match:
                errors.append({
                    'file': 'unknown',
                    'line': 0,
                    'col': 0,
                    'code': match.group(1),
                    'message': match.group(2)
                })
    return errors

def analyze_file(file_path, errors):
    """Show the problematic lines in a file"""
    if not os.path.exists(file_path):
        return
    
    print_subheader(f"📄 {file_path}")
    print_info(f"Errors: {len(errors)}")
    
    for err in errors:
        print(f"  {RED}Line {err['line']}, Col {err['col']}: {err['code']}{NC}")
        print(f"  {err['message']}")
        
        # Show the problematic line
        try:
            with open(file_path, 'r') as f:
                lines = f.readlines()
                if err['line'] <= len(lines):
                    line = lines[err['line'] - 1].rstrip()
                    print(f"  {YELLOW}→ {line}{NC}")
                    # Show context (line before and after)
                    if err['line'] > 1:
                        print(f"    {lines[err['line']-2].rstrip()}")
                    if err['line'] < len(lines):
                        print(f"    {lines[err['line']].rstrip()}")
        except:
            pass
        print()

def scan_project():
    """Main scan function"""
    print_header("🔍 ALE KIRCHA - COMPLETE ERROR SCANNER")
    print_info(f"Scan started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    directories = [
        ('API', 'apps/api'),
        ('Customer Bot', 'apps/customer-bot'),
        ('Admin Bot', 'apps/admin-bot')
    ]
    
    all_results = {}
    total_errors = 0
    
    for name, dir_path in directories:
        print_header(f"📁 {name} ({dir_path})")
        
        if not os.path.exists(dir_path):
            print_error(f"Directory not found: {dir_path}")
            continue
        
        # Get errors
        output = get_ts_errors(dir_path)
        errors = parse_errors(output)
        
        all_results[name] = {
            'path': dir_path,
            'errors': errors,
            'count': len(errors)
        }
        total_errors += len(errors)
        
        if len(errors) == 0:
            print_success("✅ NO ERRORS FOUND")
        else:
            print_error(f"Found {len(errors)} errors")
            
            # Group errors by file
            files_with_errors = {}
            for err in errors:
                file_key = err['file']
                if file_key not in files_with_errors:
                    files_with_errors[file_key] = []
                files_with_errors[file_key].append(err)
            
            for file_path, file_errors in files_with_errors.items():
                full_path = os.path.join(dir_path, file_path)
                analyze_file(full_path, file_errors)
    
    # Summary
    print_header("📊 SUMMARY")
    print_info(f"Total errors found: {total_errors}")
    print()
    
    for name, result in all_results.items():
        if result['count'] == 0:
            print_success(f"{name}: {result['count']} errors ✅")
        else:
            print_error(f"{name}: {result['count']} errors")
            # List error types
            error_types = {}
            for err in result['errors']:
                code = err['code']
                if code not in error_types:
                    error_types[code] = 0
                error_types[code] += 1
            for code, count in error_types.items():
                print(f"  {code}: {count} occurrences")
    
    print_header("📋 RECOMMENDED FIXES")
    
    if total_errors > 0:
        print_info("Run these commands to fix the errors:")
        print()
        print(f"  {YELLOW}cd ~/Ale-Kircha && python3 fix_all_errors.py{NC}")
        print()
        print_info("Or fix individually:")
        print()
        print(f"  {YELLOW}# Fix notification controller{NC}")
        print(f"  cd apps/api && python3 fix_notification_commas.py")
        print()
        print(f"  {YELLOW}# Fix customer bot{NC}")
        print(f"  cd apps/customer-bot && python3 fix_customer_line477.py")
        print()
        print(f"  {YELLOW}# Fix admin bot keyboards{NC}")
        print(f"  cd apps/admin-bot && python3 fix_admin_keyboards.py")
    
    print_header("✅ SCAN COMPLETE")
    
    return all_results

if __name__ == "__main__":
    scan_project()
