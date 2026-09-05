#!/usr/bin/env python3
"""
ALE KIRCHA - COMPLETE ERROR SCANNER (FIXED PATHS)
"""

import os
import re
import subprocess
from datetime import datetime

GREEN = '\033[92m'
RED = '\033[91m'
BLUE = '\033[94m'
YELLOW = '\033[93m'
CYAN = '\033[96m'
NC = '\033[0m'

def print_header(msg):
    print(f"\n{BLUE}{'='*60}{NC}")
    print(f"{BLUE}{msg}{NC}")
    print(f"{BLUE}{'='*60}{NC}")

def print_info(msg):
    print(f"{BLUE}ℹ️ {msg}{NC}")

def print_error(msg):
    print(f"{RED}❌ {msg}{NC}")

def print_success(msg):
    print(f"{GREEN}✅ {msg}{NC}")

def get_ts_errors(directory):
    """Run tsc and capture errors"""
    original_dir = os.getcwd()
    os.chdir(directory)
    result = subprocess.run(['npx', 'tsc', '--noEmit'], 
                           capture_output=True, text=True)
    os.chdir(original_dir)
    return result.stdout + result.stderr

def parse_errors(output):
    """Parse TypeScript errors from output"""
    errors = []
    for line in output.split('\n'):
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

def scan_project():
    """Main scan function"""
    print_header("🔍 ALE KIRCHA - COMPLETE ERROR SCANNER")
    print_info(f"Scan started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Fix the paths - use the actual locations
    directories = {
        'API': 'apps/api',
        'Customer Bot': 'apps/customer-bot',
        'Admin Bot': 'apps/admin-bot'
    }
    
    all_results = {}
    total_errors = 0
    
    for name, dir_path in directories.items():
        print_header(f"📁 {name} ({dir_path})")
        
        if not os.path.exists(dir_path):
            print_error(f"Directory not found: {dir_path}")
            # Try to find it
            found = False
            for root, dirs, files in os.walk('apps'):
                if dir_path.split('/')[-1] in dirs:
                    actual_path = os.path.join(root, dir_path.split('/')[-1])
                    print_info(f"Found at: {actual_path}")
                    dir_path = actual_path
                    found = True
                    break
            if not found:
                continue
        
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
            for err in errors[:10]:
                print(f"  {RED}Line {err['line']}: {err['code']} - {err['message']}{NC}")
    
    # Summary
    print_header("📊 SUMMARY")
    print_info(f"Total errors found: {total_errors}")
    print()
    
    for name, result in all_results.items():
        if result['count'] == 0:
            print_success(f"{name}: {result['count']} errors ✅")
        else:
            print_error(f"{name}: {result['count']} errors")
    
    return all_results

if __name__ == "__main__":
    scan_project()
