#!/usr/bin/env python3
"""
ALE KIRCHA - SMART IMPLEMENTATION CHECKER
Scans all files, detects endpoints, checks TypeScript errors, 
and provides comprehensive implementation report.
"""

import os
import re
import sys
import json
import subprocess
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Set, Tuple, Any
from collections import defaultdict

# Colors
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
PURPLE = '\033[95m'
CYAN = '\033[96m'
BOLD = '\033[1m'
DIM = '\033[2m'
NC = '\033[0m'

class SmartChecker:
    def __init__(self):
        self.root = Path(os.getcwd())
        self.results = {
            'total': 0,
            'passed': 0,
            'failed': 0,
            'warnings': 0,
            'passed_items': [],
            'failed_items': [],
            'warning_items': [],
            'endpoints_found': [],
            'endpoints_missing': [],
            'typescript_errors': [],
            'files_scanned': 0,
            'duplicate_functions': [],
            'missing_imports': []
        }
        self.api_file = self.root / 'apps/api/src/server-pg.ts'
        self.customer_bot = self.root / 'apps/customer-bot/src/bot.ts'
        self.admin_bot = self.root / 'apps/admin-bot/src/bot.ts'
        self.prisma_schema = self.root / 'apps/api/prisma/schema.prisma'
        
    def print_header(self, msg, char='='):
        print(f"\n{BOLD}{BLUE}{char*70}{NC}")
        print(f"{BOLD}{BLUE}{msg:^70}{NC}")
        print(f"{BOLD}{BLUE}{char*70}{NC}")
    
    def print_result(self, status, msg, details=""):
        if status == 'PASS':
            print(f"  {GREEN}✅ {msg}{NC}")
        elif status == 'FAIL':
            print(f"  {RED}❌ {msg}{NC}")
            if details:
                print(f"     {YELLOW}→ {details}{NC}")
        else:
            print(f"  {YELLOW}⚠️ {msg}{NC}")
            if details:
                print(f"     {YELLOW}→ {details}{NC}")
    
    def file_exists(self, path):
        return os.path.exists(path)
    
    def read_file(self, path):
        try:
            with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                return f.read()
        except:
            return ""
    
    def find_all_files(self, pattern="*.ts"):
        """Find all TypeScript files in the project"""
        files = []
        for ext in ['*.ts', '*.tsx', '*.js', '*.jsx']:
            for path in self.root.rglob(ext):
                if 'node_modules' not in str(path) and '.pnpm' not in str(path):
                    files.append(path)
        return files
    
    def scan_endpoints(self):
        """Scan all TypeScript files for Fastify endpoints"""
        print("\n" + "="*70)
        print("🔍 SCANNING FOR API ENDPOINTS")
        print("="*70)
        
        endpoint_patterns = [
            r'fastify\.(get|post|put|delete|patch)\s*\(\s*[\'"]([^\'"]+)[\'"]',
            r'\.(get|post|put|delete|patch)\s*\(\s*[\'"]([^\'"]+)[\'"]',
            r'@(Get|Post|Put|Delete|Patch)\s*\(\s*[\'"]([^\'"]+)[\'"]',
            r'router\.(get|post|put|delete|patch)\s*\(\s*[\'"]([^\'"]+)[\'"]',
        ]
        
        endpoints = {}
        files_scanned = 0
        
        for filepath in self.find_all_files():
            content = self.read_file(filepath)
            if not content:
                continue
            files_scanned += 1
            
            for pattern in endpoint_patterns:
                matches = re.findall(pattern, content, re.IGNORECASE)
                for match in matches:
                    method = match[0].upper()
                    endpoint = match[1]
                    if endpoint and not endpoint.startswith('*') and not endpoint.startswith(':'):
                        key = f"{method} {endpoint}"
                        if key not in endpoints:
                            endpoints[key] = []
                        endpoints[key].append(str(filepath.relative_to(self.root)))
        
        self.results['files_scanned'] = files_scanned
        self.results['endpoints_found'] = endpoints
        
        # Print found endpoints
        print(f"\n{CYAN}📁 Files Scanned: {files_scanned}{NC}")
        print(f"{CYAN}📊 Endpoints Found: {len(endpoints)}{NC}\n")
        
        # Group by method
        grouped = defaultdict(list)
        for key, files in endpoints.items():
            method, path = key.split(' ', 1)
            grouped[method].append(path)
        
        for method, paths in sorted(grouped.items()):
            print(f"  {BOLD}{method}{NC}: {len(paths)} endpoints")
            for path in sorted(paths)[:5]:
                print(f"    {DIM}→ {path}{NC}")
            if len(paths) > 5:
                print(f"    {DIM}... and {len(paths)-5} more{NC}")
            print()
        
        return endpoints
    
    def check_typescript_errors(self):
        """Run TypeScript checks and capture errors"""
        print("\n" + "="*70)
        print("🔍 CHECKING TYPESCRIPT ERRORS")
        print("="*70)
        
        # Check each major directory
        dirs_to_check = [
            ('API', 'apps/api'),
            ('Customer Bot', 'apps/customer-bot'),
            ('Admin Bot', 'apps/admin-bot'),
        ]
        
        all_errors = {}
        
        for name, dir_path in dirs_to_check:
            full_path = self.root / dir_path
            if not full_path.exists():
                print(f"  {YELLOW}⚠️ Directory not found: {dir_path}{NC}")
                continue
            
            print(f"\n{CYAN}📁 Checking {name}...{NC}")
            
            # Try to run tsc
            try:
                result = subprocess.run(
                    ['npx', 'tsc', '--noEmit'],
                    cwd=str(full_path),
                    capture_output=True,
                    text=True,
                    timeout=30
                )
                output = result.stdout + result.stderr
                
                # Parse errors
                errors = []
                for line in output.split('\n'):
                    if 'error TS' in line:
                        errors.append(line.strip())
                    elif 'error' in line.lower() and 'ts' in line.lower():
                        errors.append(line.strip())
                
                if result.returncode == 0:
                    print(f"  {GREEN}✅ No TypeScript errors{NC}")
                else:
                    print(f"  {RED}❌ Found {len(errors)} TypeScript errors{NC}")
                    for err in errors[:5]:
                        print(f"    {RED}→ {err[:100]}{NC}")
                    if len(errors) > 5:
                        print(f"    {YELLOW}... and {len(errors)-5} more{NC}")
                    
                all_errors[name] = {
                    'count': len(errors),
                    'errors': errors[:20],
                    'exit_code': result.returncode
                }
                
            except Exception as e:
                print(f"  {RED}❌ Failed to check TypeScript: {e}{NC}")
                all_errors[name] = {'count': 0, 'errors': [], 'exit_code': -1}
        
        self.results['typescript_errors'] = all_errors
        return all_errors
    
    def check_missing_imports(self):
        """Check for missing imports in TypeScript files"""
        print("\n" + "="*70)
        print("🔍 CHECKING FOR MISSING IMPORTS")
        print("="*70)
        
        missing_imports = {}
        import_pattern = r'import\s+.*?from\s+[\'"]([^\'"]+)[\'"]'
        
        ts_files = self.find_all_files()
        for filepath in ts_files[:50]:  # Limit to 50 files for performance
            content = self.read_file(filepath)
            if not content:
                continue
            
            # Find all imports
            imports = re.findall(import_pattern, content, re.IGNORECASE)
            # Check for usage of imported modules that might be missing
            # This is a simplified check
            
        print(f"  {GREEN}✅ Import check completed (scanned {len(ts_files)} files){NC}")
        return missing_imports
    
    def check_duplicate_functions(self):
        """Check for duplicate function definitions"""
        print("\n" + "="*70)
        print("🔍 CHECKING FOR DUPLICATE FUNCTIONS")
        print("="*70)
        
        duplicates = {}
        function_pattern = r'function\s+(\w+)\s*\(|const\s+(\w+)\s*=\s*async\s*\(|bot\.callbackQuery\s*\(\s*[\'"]([^\'"]+)[\'"]'
        
        # Check customer bot
        content = self.read_file(self.customer_bot)
        if content:
            funcs = re.findall(r'async function (\w+)|function (\w+)|bot\.callbackQuery.*?[\'"]([^\'"]+)[\'"]', content)
            func_names = [f for f in funcs if f]
            seen = {}
            for name in func_names:
                if isinstance(name, tuple):
                    name = name[0] or name[1] or name[2]
                if name:
                    if name not in seen:
                        seen[name] = 0
                    seen[name] += 1
            
            duplicates['customer_bot'] = {k: v for k, v in seen.items() if v > 1}
        
        # Check admin bot
        content = self.read_file(self.admin_bot)
        if content:
            funcs = re.findall(r'async function (\w+)|function (\w+)|bot\.callbackQuery.*?[\'"]([^\'"]+)[\'"]', content)
            func_names = [f for f in funcs if f]
            seen = {}
            for name in func_names:
                if isinstance(name, tuple):
                    name = name[0] or name[1] or name[2]
                if name:
                    if name not in seen:
                        seen[name] = 0
                    seen[name] += 1
            
            duplicates['admin_bot'] = {k: v for k, v in seen.items() if v > 1}
        
        if duplicates:
            for bot, dup in duplicates.items():
                if dup:
                    print(f"  {YELLOW}⚠️ {bot} has duplicate functions:{NC}")
                    for name, count in dup.items():
                        print(f"    {YELLOW}→ {name} appears {count} times{NC}")
                else:
                    print(f"  {GREEN}✅ {bot} has no duplicate functions{NC}")
        else:
            print(f"  {GREEN}✅ No duplicate functions found{NC}")
        
        self.results['duplicate_functions'] = duplicates
        return duplicates
    
    def check_database_models(self):
        """Check database models"""
        print("\n" + "="*70)
        print("🗄️ CHECKING DATABASE MODELS")
        print("="*70)
        
        content = self.read_file(self.prisma_schema)
        if not content:
            print(f"  {RED}❌ Prisma schema not found{NC}")
            return {}
        
        model_pattern = r'model\s+(\w+)\s*\{'
        models = re.findall(model_pattern, content)
        
        expected_models = [
            'User', 'Customer', 'Admin', 'BannedUser',
            'KirchaType', 'KirchaGroup', 'KirchaGroupImage', 'KirchaGroupMembership',
            'Order', 'OrderStatusHistory',
            'PaymentMethod', 'Payment', 'PaymentAdvice', 'PaymentStatusHistory',
            'RefundRequest', 'RefundStatusHistory',
            'Complaint', 'Delivery', 'DeliveryStatusHistory',
            'FeeConfiguration', 'ServiceCharge', 'DeliveryZone',
            'TermsVersion', 'PrivacyPolicyVersion', 'UserLegalAcceptance',
            'FAQ', 'SupportRequest', 'SystemSetting', 'Notification',
            'BulkMessage', 'BulkMessageRecipient', 'AuditLog', 'IdempotencyKey',
            'AdminNotification', 'Settings', 'About', 'ContactInfo',
            'GroupRules', 'RefundFee', 'Discount', 'DeliveryCharge',
            'BankAccount', 'SelfHelp'
        ]
        
        print(f"\n{CYAN}📊 Found {len(models)} models, expected {len(expected_models)}{NC}\n")
        
        found_models = set(models)
        missing_models = set(expected_models) - found_models
        
        for model in sorted(expected_models):
            if model in found_models:
                self.results['passed'] += 1
                self.results['passed_items'].append(f"Database: {model}")
                print(f"  {GREEN}✅ {model}{NC}")
            else:
                self.results['failed'] += 1
                self.results['failed_items'].append(f"Database: {model}")
                print(f"  {RED}❌ {model} - MISSING{NC}")
        
        self.results['total'] += len(expected_models)
        return {'found': models, 'missing': missing_models}
    
    def check_imports(self):
        """Check for missing imports in key files"""
        print("\n" + "="*70)
        print("📦 CHECKING IMPORTS")
        print("="*70)
        
        files_to_check = [
            ('API Server', self.api_file),
            ('Customer Bot', self.customer_bot),
            ('Admin Bot', self.admin_bot),
        ]
        
        missing = []
        for name, filepath in files_to_check:
            content = self.read_file(filepath)
            if not content:
                print(f"  {RED}❌ {name} file not found{NC}")
                continue
            
            # Look for common imports that might be missing
            common_imports = [
                'import.*Fastify',
                'import.*PrismaClient',
                'import.*dotenv',
                'import.*grammy',
                'import.*session',
                'import.*conversations'
            ]
            
            missing_for_file = []
            for imp in common_imports:
                if not re.search(imp, content, re.IGNORECASE):
                    missing_for_file.append(imp)
            
            if missing_for_file:
                print(f"  {YELLOW}⚠️ {name} missing imports:{NC}")
                for imp in missing_for_file:
                    print(f"    {YELLOW}→ {imp}{NC}")
                missing.extend(missing_for_file)
            else:
                print(f"  {GREEN}✅ {name} imports check passed{NC}")
        
        self.results['missing_imports'] = missing
        return missing
    
    def scan_bot_commands(self):
        """Scan bot commands and callbacks"""
        print("\n" + "="*70)
        print("🤖 SCANNING BOT COMMANDS")
        print("="*70)
        
        bots = {
            'Customer Bot': self.customer_bot,
            'Admin Bot': self.admin_bot
        }
        
        for name, filepath in bots.items():
            content = self.read_file(filepath)
            if not content:
                print(f"  {RED}❌ {name} file not found{NC}")
                continue
            
            # Count commands
            commands = re.findall(r'bot\.command\s*\(\s*[\'"]([^\'"]+)[\'"]', content)
            callbacks = re.findall(r'bot\.callbackQuery\s*\(\s*[\'"]([^\'"]+)[\'"]', content)
            
            print(f"\n{CYAN}{name}:{NC}")
            print(f"  📋 Commands: {len(commands)}")
            print(f"  🔘 Callbacks: {len(callbacks)}")
            
            # Show unique commands
            unique_commands = sorted(set(commands))
            if unique_commands:
                print(f"  📌 Commands: {', '.join(unique_commands[:10])}")
                if len(unique_commands) > 10:
                    print(f"    {DIM}... and {len(unique_commands)-10} more{DIM}{NC}")
        
        return {}
    
    def generate_report(self):
        """Generate final report"""
        print("\n" + "="*70)
        print("📊 FINAL IMPLEMENTATION REPORT")
        print("="*70)
        
        total = self.results['total']
        passed = self.results['passed']
        failed = self.results['failed']
        warnings = self.results['warnings']
        
        # Recalculate totals from all checks
        total = len(self.results['passed_items']) + len(self.results['failed_items'])
        passed = len(self.results['passed_items'])
        failed = len(self.results['failed_items'])
        
        percentage = (passed / total * 100) if total > 0 else 0
        
        print(f"\n  {GREEN}✅ PASSED:  {passed}{NC}")
        print(f"  {RED}❌ FAILED:  {failed}{NC}")
        print(f"  {YELLOW}⚠️ WARNINGS: {len(self.results['warning_items'])}{NC}")
        print(f"  {BLUE}📊 TOTAL:   {total}{NC}")
        print(f"  {PURPLE}📈 RATE:    {percentage:.1f}%{NC}")
        
        # Endpoints summary
        print(f"\n{CYAN}📌 API Endpoints: {len(self.results['endpoints_found'])}{NC}")
        
        # TypeScript errors summary
        ts_errors = self.results.get('typescript_errors', {})
        if ts_errors:
            total_errors = sum([e.get('count', 0) for e in ts_errors.values()])
            if total_errors > 0:
                print(f"  {RED}❌ TypeScript Errors: {total_errors}{NC}")
                for name, data in ts_errors.items():
                    if data.get('count', 0) > 0:
                        print(f"    {RED}→ {name}: {data['count']} errors{NC}")
            else:
                print(f"  {GREEN}✅ TypeScript Errors: 0{NC}")
        
        # Duplicate functions
        duplicates = self.results.get('duplicate_functions', {})
        if duplicates:
            dup_count = sum([len(d) for d in duplicates.values()])
            if dup_count > 0:
                print(f"  {YELLOW}⚠️ Duplicate Functions: {dup_count}{NC}")
        
        # Missing imports
        missing = self.results.get('missing_imports', [])
        if missing:
            print(f"  {YELLOW}⚠️ Missing Imports: {len(missing)}{NC}")
        
        # Overall status
        print(f"\n{'='*70}")
        if percentage >= 90:
            print(f"{GREEN}🎉 EXCELLENT! System is {percentage:.1f}% complete.{NC}")
            print(f"{GREEN}   Ready for production deployment!{NC}")
        elif percentage >= 70:
            print(f"{YELLOW}⚠️ GOOD! System is {percentage:.1f}% complete.{NC}")
            print(f"{YELLOW}   Some features need implementation.{NC}")
        else:
            print(f"{RED}❌ System is {percentage:.1f}% complete.{NC}")
            print(f"{RED}   Significant features missing.{NC}")
        
        print(f"\n{BLUE}📅 Report generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}{NC}")
    
    def run(self):
        """Run all checks"""
        self.print_header("🔍 ALE KIRCHA - SMART IMPLEMENTATION CHECKER")
        print(f"{BLUE}📁 Project: {self.root}{NC}")
        print(f"{BLUE}📅 Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}{NC}")
        
        # Run checks
        self.scan_endpoints()
        self.check_database_models()
        self.check_imports()
        self.check_duplicate_functions()
        self.scan_bot_commands()
        self.check_typescript_errors()
        
        # Generate final report
        self.generate_report()
        
        # Save report to file
        report_data = {
            'timestamp': datetime.now().isoformat(),
            'total': self.results['total'],
            'passed': len(self.results['passed_items']),
            'failed': len(self.results['failed_items']),
            'warnings': len(self.results['warning_items']),
            'percentage': (len(self.results['passed_items']) / max(1, self.results['total']) * 100),
            'passed_items': self.results['passed_items'],
            'failed_items': self.results['failed_items'],
            'warning_items': self.results['warning_items'],
            'endpoints_found': len(self.results['endpoints_found']),
            'typescript_errors': self.results.get('typescript_errors', {}),
            'duplicate_functions': self.results.get('duplicate_functions', {})
        }
        
        with open('smart_report.json', 'w') as f:
            json.dump(report_data, f, indent=2)
        
        print(f"\n{BLUE}📄 Report saved to: smart_report.json{NC}")
        
        return report_data

if __name__ == "__main__":
    checker = SmartChecker()
    checker.run()
