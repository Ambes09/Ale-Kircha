#!/usr/bin/env python3
"""
ALE KIRCHA - COMPLETE IMPLEMENTATION AUDIT
Checks all features and provides detailed report of what's implemented, missing, or needs fixes.
"""

import os
import re
import json
import subprocess
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Set, Tuple

# Colors for output
GREEN = '\033[92m'
YELLOW = '\033[93m'
RED = '\033[91m'
BLUE = '\033[94m'
PURPLE = '\033[95m'
CYAN = '\033[96m'
BOLD = '\033[1m'
NC = '\033[0m'

class AuditResult:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.warning = 0
        self.results = {}
        self.errors = []
        self.warnings = []

    def add_result(self, category: str, item: str, status: str, message: str = ""):
        if category not in self.results:
            self.results[category] = []
        self.results[category].append({
            'item': item,
            'status': status,
            'message': message
        })
        if status == 'PASS':
            self.passed += 1
        elif status == 'FAIL':
            self.failed += 1
            self.errors.append(f"{category} - {item}: {message}")
        else:
            self.warning += 1
            self.warnings.append(f"{category} - {item}: {message}")

def print_header(msg):
    print(f"\n{BOLD}{BLUE}{'='*70}{NC}")
    print(f"{BOLD}{BLUE}{msg:^70}{NC}")
    print(f"{BOLD}{BLUE}{'='*70}{NC}")

def print_subheader(msg):
    print(f"\n{CYAN}▶ {msg}{NC}")

def print_result(status, msg):
    if status == 'PASS':
        print(f"  {GREEN}✅ {msg}{NC}")
    elif status == 'FAIL':
        print(f"  {RED}❌ {msg}{NC}")
    else:
        print(f"  {YELLOW}⚠️ {msg}{NC}")

def read_file_content(filepath):
    try:
        with open(filepath, 'r') as f:
            return f.read()
    except:
        return ""

def file_exists(filepath):
    return os.path.exists(filepath)

def grep_pattern(filepath, pattern):
    content = read_file_content(filepath)
    return re.search(pattern, content, re.IGNORECASE) is not None

def grep_count(filepath, pattern):
    content = read_file_content(filepath)
    return len(re.findall(pattern, content, re.IGNORECASE))

def check_api_endpoint(filepath, endpoint):
    return grep_pattern(filepath, f"fastify\\.(get|post|put|delete)\\(['\"].*{endpoint}")

def check_bot_handler(filepath, handler):
    return grep_pattern(filepath, f"bot\\.(command|callbackQuery|on)\\(['\"].*{handler}")

class AleKirchaAudit:
    def __init__(self):
        self.root = Path(os.getcwd())
        self.api_dir = self.root / 'apps/api'
        self.customer_bot_dir = self.root / 'apps/customer-bot'
        self.admin_bot_dir = self.root / 'apps/admin-bot'
        self.prisma_schema = self.api_dir / 'prisma/schema.prisma'
        self.result = AuditResult()
        
    def audit_all(self):
        print_header("🔍 ALE KIRCHA - COMPLETE IMPLEMENTATION AUDIT")
        print(f"{BLUE}📅 Audit Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}{NC}")
        print(f"{BLUE}📁 Project Root: {self.root}{NC}")
        print()
        
        self.audit_database()
        self.audit_api_endpoints()
        self.audit_customer_bot()
        self.audit_admin_bot()
        self.audit_notifications()
        self.audit_sla_timers()
        self.audit_reports()
        self.audit_bilingual()
        self.audit_security()
        
        self.print_summary()
        return self.result
    
    def audit_database(self):
        print_header("🗄️ DATABASE SCHEMA AUDIT")
        
        if not file_exists(self.prisma_schema):
            self.result.add_result('Database', 'Prisma Schema', 'FAIL', 'schema.prisma not found')
            return
        
        content = read_file_content(self.prisma_schema)
        
        models = {
            'User': 'User model',
            'Customer': 'Customer model',
            'Admin': 'Admin model',
            'KirchaType': 'Kircha Type model',
            'KirchaGroup': 'Kircha Group model',
            'KirchaGroupMembership': 'Group Membership model',
            'Order': 'Order model',
            'Payment': 'Payment model',
            'PaymentAdvice': 'Payment Advice model',
            'RefundRequest': 'Refund Request model',
            'Delivery': 'Delivery model',
            'FeeConfiguration': 'Fee Configuration model',
            'FAQ': 'FAQ model',
            'TermsVersion': 'Terms Version model',
            'PrivacyPolicyVersion': 'Privacy Policy Version model',
            'UserLegalAcceptance': 'User Legal Acceptance model',
            'SupportRequest': 'Support Request model',
            'SystemSetting': 'System Setting model',
            'Notification': 'Notification model',
            'AdminNotification': 'Admin Notification model',
            'BankAccount': 'Bank Account model',
            'ContactInfo': 'Contact Info model',
            'About': 'About model',
            'GroupRules': 'Group Rules model',
            'RefundFee': 'Refund Fee model',
            'Discount': 'Discount model',
            'SelfHelp': 'Self Help model'
        }
        
        print_subheader("Models Check")
        
        for model_name, description in models.items():
            exists = re.search(f"model {model_name}", content) is not None
            if exists:
                self.result.add_result('Database', description, 'PASS')
                print_result('PASS', f"{description}")
            else:
                self.result.add_result('Database', description, 'FAIL', f"Model {model_name} not found")
                print_result('FAIL', f"{description} - {RED}MISSING{NC}")
        
        # Check Decimal usage for money
        decimal_fields = re.findall(r'(\w+)\s+Decimal', content)
        if decimal_fields:
            self.result.add_result('Database', 'Decimal for monetary values', 'PASS')
            print_result('PASS', f"Decimal used for monetary values ({len(decimal_fields)} fields)")
        else:
            self.result.add_result('Database', 'Decimal for monetary values', 'FAIL', 'No Decimal fields found')
            print_result('FAIL', "Decimal for monetary values - NOT FOUND")
    
    def audit_api_endpoints(self):
        print_header("🔌 API ENDPOINTS AUDIT")
        
        api_file = self.api_dir / 'src/server-pg.ts'
        if not file_exists(api_file):
            self.result.add_result('API', 'Server file', 'FAIL', 'server-pg.ts not found')
            return
        
        content = read_file_content(api_file)
        
        endpoints = {
            '/health': 'Health Check',
            '/api/v1/health': 'API Version Health',
            '/api/v1/admin/stats': 'Admin Stats',
            '/api/v1/customers': 'Customer List',
            '/api/v1/customers/register': 'Customer Registration',
            '/api/v1/customers/me': 'Customer Profile',
            '/api/v1/kircha/groups': 'Kircha Groups',
            '/api/v1/orders': 'Orders List',
            '/api/v1/payments': 'Payments List',
            '/api/v1/refunds': 'Refunds List',
            '/api/v1/deliveries': 'Deliveries List',
            '/api/v1/admin/users': 'Admin Users',
            '/api/v1/audit': 'Audit Log',
            '/api/v1/support/tickets': 'Support Tickets',
            '/api/v1/faq': 'FAQ',
            '/api/v1/terms': 'Terms',
            '/api/v1/about': 'About',
            '/api/v1/fees': 'Fees',
            '/api/v1/admin/banks': 'Bank Accounts',
            '/api/v1/admin/notify': 'Admin Notification',
            '/api/v1/settings': 'Settings'
        }
        
        print_subheader("Endpoint Check")
        
        for endpoint, description in endpoints.items():
            exists = re.search(f"fastify\\.(get|post|put|delete)\\(['\"].*{endpoint}", content) is not None
            if exists:
                self.result.add_result('API', description, 'PASS')
                print_result('PASS', f"{description} ({endpoint})")
            else:
                self.result.add_result('API', description, 'FAIL', f"Endpoint {endpoint} not found")
                print_result('FAIL', f"{description} ({endpoint}) - {RED}MISSING{NC}")
    
    def audit_customer_bot(self):
        print_header("🤖 CUSTOMER BOT AUDIT")
        
        bot_file = self.customer_bot_dir / 'src/bot.ts'
        if not file_exists(bot_file):
            self.result.add_result('Customer Bot', 'Bot file', 'FAIL', 'bot.ts not found')
            return
        
        content = read_file_content(bot_file)
        
        features = {
            'start_command': ('/start command', 'bot.command.*start'),
            'language_selection': ('Language Selection', 'lang_(en|am)'),
            'phone_number': ('Phone Number Sharing', 'message:contact'),
            'registration': ('Registration Flow', 'registrationConversation'),
            'main_menu': ('Main Menu', 'show_menu'),
            'available_kircha': ('Available Kircha', 'menu_groups'),
            'order_placement': ('Order Placement', 'menu_orders'),
            'payment_submission': ('Payment Submission', 'payment_advice|pay'),
            'refund_request': ('Refund Request', 'refund'),
            'profile_management': ('Profile Management', 'menu_profile'),
            'help_support': ('Help/Support', 'menu_help|menu_contact'),
            'faq': ('FAQ', 'faq'),
            'settings': ('Settings', 'menu_settings')
        }
        
        print_subheader("Features Check")
        
        for key, (description, pattern) in features.items():
            exists = re.search(pattern, content, re.IGNORECASE) is not None
            if exists:
                self.result.add_result('Customer Bot', description, 'PASS')
                print_result('PASS', f"{description}")
            else:
                self.result.add_result('Customer Bot', description, 'FAIL', f"{description} not found")
                print_result('FAIL', f"{description} - {RED}MISSING{NC}")
        
        # Check i18n files
        i18n_dir = self.customer_bot_dir / 'src/i18n'
        if file_exists(i18n_dir / 'en.ts'):
            self.result.add_result('Customer Bot', 'i18n - English', 'PASS')
            print_result('PASS', "i18n - English file exists")
        else:
            self.result.add_result('Customer Bot', 'i18n - English', 'FAIL', 'en.ts not found')
            print_result('FAIL', "i18n - English - MISSING")
        
        if file_exists(i18n_dir / 'am.ts'):
            self.result.add_result('Customer Bot', 'i18n - Amharic', 'PASS')
            print_result('PASS', "i18n - Amharic file exists")
        else:
            self.result.add_result('Customer Bot', 'i18n - Amharic', 'FAIL', 'am.ts not found')
            print_result('FAIL', "i18n - Amharic - MISSING")
    
    def audit_admin_bot(self):
        print_header("👨‍💼 ADMIN BOT AUDIT")
        
        bot_file = self.admin_bot_dir / 'src/bot.ts'
        if not file_exists(bot_file):
            self.result.add_result('Admin Bot', 'Bot file', 'FAIL', 'bot.ts not found')
            return
        
        content = read_file_content(bot_file)
        
        features = {
            'dashboard': ('Dashboard', 'admin_dashboard'),
            'customers': ('Customer Management', 'admin_customers'),
            'customer_search': ('Customer Search', 'customers_search'),
            'groups': ('Group Management', 'admin_groups'),
            'group_create': ('Create Group', 'groups_create'),
            'group_approval': ('Group Approval', 'group_approve|groups_pending'),
            'orders': ('Order Management', 'admin_orders'),
            'payments': ('Payment Management', 'admin_payments'),
            'payment_verify': ('Payment Verification', 'payment_confirm|payments_review'),
            'refunds': ('Refund Management', 'admin_refunds'),
            'refund_approve': ('Refund Approval', 'refund_accept'),
            'delivery': ('Delivery Management', 'admin_delivery'),
            'fees': ('Fees Management', 'admin_fees'),
            'fee_add': ('Add Fee', 'fee_add'),
            'faq': ('FAQ Management', 'admin_faq'),
            'faq_add': ('Add FAQ', 'faq_add'),
            'terms': ('Terms Management', 'admin_terms'),
            'terms_create': ('Create Terms', 'terms_create'),
            'about': ('About Management', 'admin_about'),
            'about_edit': ('Edit About', 'about_edit'),
            'banks': ('Bank Management', 'admin_banks'),
            'bank_add': ('Add Bank', 'bank_add'),
            'support': ('Support Tickets', 'admin_support'),
            'users': ('Admin Users', 'admin_users'),
            'users_add': ('Add Admin', 'users_add'),
            'audit': ('Audit Log', 'admin_audit'),
            'settings': ('Settings', 'admin_settings'),
            'notifications': ('Notifications', 'admin_notifications'),
            'reports': ('Reports', 'admin_reports')
        }
        
        print_subheader("Features Check")
        
        for key, (description, pattern) in features.items():
            exists = re.search(pattern, content, re.IGNORECASE) is not None
            if exists:
                self.result.add_result('Admin Bot', description, 'PASS')
                print_result('PASS', f"{description}")
            else:
                self.result.add_result('Admin Bot', description, 'FAIL', f"{description} not found")
                print_result('FAIL', f"{description} - {RED}MISSING{NC}")
    
    def audit_notifications(self):
        print_header("🔔 NOTIFICATIONS AUDIT")
        
        # Check API notification endpoints
        api_file = self.api_dir / 'src/server-pg.ts'
        api_content = read_file_content(api_file) if file_exists(api_file) else ""
        
        admin_notify_exists = '/admin/notify' in api_content
        notifications_endpoint = '/admin/notifications' in api_content
        
        if admin_notify_exists and notifications_endpoint:
            self.result.add_result('Notifications', 'Admin Notification API', 'PASS')
            print_result('PASS', "Admin Notification API exists")
        else:
            self.result.add_result('Notifications', 'Admin Notification API', 'FAIL', 'Notification endpoints missing')
            print_result('FAIL', "Admin Notification API - MISSING")
        
        # Check customer notification triggers
        customer_file = self.customer_bot_dir / 'src/bot.ts'
        customer_content = read_file_content(customer_file) if file_exists(customer_file) else ""
        
        notification_triggers = [
            ('Registration Complete', 'admin/notify.*registration'),
            ('Payment Submitted', 'admin/notify.*payment'),
            ('Refund Requested', 'admin/notify.*refund')
        ]
        
        for trigger, pattern in notification_triggers:
            exists = re.search(pattern, customer_content, re.IGNORECASE) is not None
            if exists:
                self.result.add_result('Notifications', f'Customer Trigger: {trigger}', 'PASS')
                print_result('PASS', f"Customer Trigger: {trigger}")
            else:
                self.result.add_result('Notifications', f'Customer Trigger: {trigger}', 'WARN', f'Could not find trigger for {trigger}')
                print_result('WARN', f"Customer Trigger: {trigger} - {YELLOW}NOT FOUND{NC}")
    
    def audit_sla_timers(self):
        print_header("⏱️ SLA TIMERS AUDIT")
        
        # Check for timer implementation
        api_content = read_file_content(self.api_dir / 'src/server-pg.ts') if file_exists(self.api_dir / 'src/server-pg.ts') else ""
        customer_content = read_file_content(self.customer_bot_dir / 'src/bot.ts') if file_exists(self.customer_bot_dir / 'src/bot.ts') else ""
        
        timers = {
            'Payment Verification SLA': ('1 hour|payment.*timer|payment.*sla', api_content),
            'Refund Processing SLA': ('2 hour|refund.*timer|refund.*sla', api_content),
            'Refund Confirmation SLA': ('1 hour|confirmation.*timer', customer_content)
        }
        
        for timer_name, (pattern, content) in timers.items():
            exists = re.search(pattern, content, re.IGNORECASE) is not None
            if exists:
                self.result.add_result('SLA Timers', timer_name, 'PASS')
                print_result('PASS', f"{timer_name}")
            else:
                self.result.add_result('SLA Timers', timer_name, 'WARN', f'{timer_name} not found')
                print_result('WARN', f"{timer_name} - {YELLOW}NOT FOUND{NC}")
    
    def audit_reports(self):
        print_header("📊 REPORTS AUDIT")
        
        api_content = read_file_content(self.api_dir / 'src/server-pg.ts') if file_exists(self.api_dir / 'src/server-pg.ts') else ""
        
        reports = {
            'Sales Report': '/reports/sales',
            'Order Report': '/reports/orders',
            'Payment Report': '/reports/payments',
            'Customer Report': '/reports/customers',
            'Group Report': '/reports/groups',
            'Refund Report': '/reports/refunds',
            'Delivery Report': '/reports/delivery',
        }
        
        for report_name, endpoint in reports.items():
            exists = endpoint in api_content
            if exists:
                self.result.add_result('Reports', report_name, 'PASS')
                print_result('PASS', f"{report_name}")
            else:
                self.result.add_result('Reports', report_name, 'FAIL', f'{report_name} endpoint not found')
                print_result('FAIL', f"{report_name} - {RED}MISSING{NC}")
    
    def audit_bilingual(self):
        print_header("🌐 BILINGUAL SUPPORT AUDIT")
        
        # Check customer bot i18n
        i18n_dir = self.customer_bot_dir / 'src/i18n'
        en_content = read_file_content(i18n_dir / 'en.ts') if file_exists(i18n_dir / 'en.ts') else ""
        am_content = read_file_content(i18n_dir / 'am.ts') if file_exists(i18n_dir / 'am.ts') else ""
        
        if en_content and am_content:
            self.result.add_result('Bilingual', 'Customer Bot i18n', 'PASS')
            print_result('PASS', "Customer Bot has English and Amharic")
        else:
            self.result.add_result('Bilingual', 'Customer Bot i18n', 'FAIL', 'Missing i18n files')
            print_result('FAIL', "Customer Bot - Missing i18n files")
        
        # Check admin bot for bilingual content
        admin_content = read_file_content(self.admin_bot_dir / 'src/bot.ts') if file_exists(self.admin_bot_dir / 'src/bot.ts') else ""
        
        # Check for Amharic content patterns
        amharic_patterns = ['አማርኛ', 'አለ', 'ቅርጫ', 'ስጋ']
        found_amharic = any(p in admin_content for p in amharic_patterns)
        
        if found_amharic:
            self.result.add_result('Bilingual', 'Admin Bot Amharic Content', 'PASS')
            print_result('PASS', "Admin Bot contains Amharic content")
        else:
            self.result.add_result('Bilingual', 'Admin Bot Amharic Content', 'WARN', 'No Amharic found in admin bot')
            print_result('WARN', "Admin Bot - No Amharic content found")
    
    def audit_security(self):
        print_header("🔐 SECURITY AUDIT")
        
        api_content = read_file_content(self.api_dir / 'src/server-pg.ts') if file_exists(self.api_dir / 'src/server-pg.ts') else ""
        admin_content = read_file_content(self.admin_bot_dir / 'src/bot.ts') if file_exists(self.admin_bot_dir / 'src/bot.ts') else ""
        
        security_checks = {
            'Admin Auth Middleware': 'bot.use.*admin|ADMIN_IDS',
            'RBAC Checks': 'role|permission',
            'Audit Logging': 'AuditLog|audit',
            'Input Validation': 'validate|zod|schema',
            'Rate Limiting': 'rate.?limit',
            'Telegram ID Validation': 'telegramId.*valid|ctx.from'
        }
        
        for check_name, pattern in security_checks.items():
            found_in_api = re.search(pattern, api_content, re.IGNORECASE) is not None
            found_in_admin = re.search(pattern, admin_content, re.IGNORECASE) is not None
            
            if found_in_api or found_in_admin:
                self.result.add_result('Security', check_name, 'PASS')
                print_result('PASS', f"{check_name}")
            else:
                self.result.add_result('Security', check_name, 'WARN', f'{check_name} not found')
                print_result('WARN', f"{check_name} - {YELLOW}NOT FOUND{NC}")
    
    def print_summary(self):
        print_header("📊 AUDIT SUMMARY")
        
        total = self.result.passed + self.result.failed + self.result.warning
        
        print(f"\n  {GREEN}✅ PASS:  {self.result.passed}{NC}")
        print(f"  {RED}❌ FAIL:  {self.result.failed}{NC}")
        print(f"  {YELLOW}⚠️ WARN:  {self.result.warning}{NC}")
        print(f"  {BLUE}📊 TOTAL: {total}{NC}")
        print()
        
        if self.result.errors:
            print_subheader("❌ ERRORS NEEDING FIX")
            for error in self.result.errors:
                print(f"  {RED}• {error}{NC}")
            print()
        
        if self.result.warnings:
            print_subheader("⚠️ WARNINGS (Review Recommended)")
            for warning in self.result.warnings:
                print(f"  {YELLOW}• {warning}{NC}")
            print()
        
        # Overall status
        print_header("🎯 OVERALL STATUS")
        if self.result.failed == 0:
            print(f"\n  {GREEN}✅ ALL CHECKS PASSED! System is ready for deployment.{NC}")
        elif self.result.failed <= 5:
            print(f"\n  {YELLOW}⚠️ System has {self.result.failed} errors. Fix them before deployment.{NC}")
        else:
            print(f"\n  {RED}❌ System has {self.result.failed} errors. Major fixes required.{NC}")
        
        print(f"\n{BLUE}📅 Audit Complete: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}{NC}")
        print(f"{BLUE}📁 Log saved to: audit_report.json{NC}")

def main():
    audit = AleKirchaAudit()
    result = audit.audit_all()
    
    # Save results to JSON
    output = {
        'timestamp': datetime.now().isoformat(),
        'passed': result.passed,
        'failed': result.failed,
        'warning': result.warning,
        'results': result.results,
        'errors': result.errors,
        'warnings': result.warnings
    }
    
    with open('audit_report.json', 'w') as f:
        json.dump(output, f, indent=2)
    
    print(f"\n{BLUE}📄 Detailed report saved to: audit_report.json{NC}")

if __name__ == "__main__":
    main()
