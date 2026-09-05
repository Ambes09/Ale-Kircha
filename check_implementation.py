#!/usr/bin/env python3
"""
ALE KIRCHA - COMPLETE IMPLEMENTATION CHECKER
Checks all features against the master specification
"""

import os
import re
import json
import subprocess
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Set, Tuple, Any

# Colors
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
PURPLE = '\033[95m'
CYAN = '\033[96m'
BOLD = '\033[1m'
NC = '\033[0m'

class ImplementationChecker:
    def __init__(self):
        self.root = Path(os.getcwd())
        self.results = {
            'passed': [],
            'failed': [],
            'partial': [],
            'total': 0
        }
        
    def print_header(self, msg):
        print(f"\n{BOLD}{BLUE}{'='*70}{NC}")
        print(f"{BOLD}{BLUE}{msg:^70}{NC}")
        print(f"{BOLD}{BLUE}{'='*70}{NC}")
    
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
    
    def grep_file(self, filepath, pattern):
        if not self.file_exists(filepath):
            return False
        try:
            with open(filepath, 'r') as f:
                return re.search(pattern, f.read(), re.IGNORECASE) is not None
        except:
            return False
    
    def count_in_file(self, filepath, pattern):
        if not self.file_exists(filepath):
            return 0
        try:
            with open(filepath, 'r') as f:
                return len(re.findall(pattern, f.read(), re.IGNORECASE))
        except:
            return 0

    def check_customer_bot_features(self):
        self.print_header("🤖 CUSTOMER BOT FEATURES")
        
        bot_file = self.root / 'apps/customer-bot/src/bot.ts'
        
        features = {
            'start_command': '/start command',
            'language_selection': 'Language Selection',
            'phone_verification': 'Phone Number Verification',
            'registration': 'Registration Flow',
            'main_menu': 'Main Menu',
            'available_kircha': 'Available Kircha Groups',
            'group_join': 'Join Group',
            'order_placement': 'Order Placement',
            'payment_submission': 'Payment Submission',
            'order_cancellation': 'Order Cancellation',
            'delivery_tracking': 'Delivery Tracking',
            'refund_request': 'Refund Request',
            'profile_management': 'Profile Management',
            'address_management': 'Address Management',
            'notification_preferences': 'Notification Preferences',
            'help_support': 'Help/Support',
            'faq': 'FAQ',
            'create_group': 'Create New Kircha Group',
            'group_request_status': 'Group Request Status',
            'settings': 'Settings'
        }
        
        patterns = {
            'start_command': r'bot\.command.*start',
            'language_selection': r'lang_(en|am)',
            'phone_verification': r'message:contact',
            'registration': r'registrationConversation',
            'main_menu': r'show_menu',
            'available_kircha': r'menu_groups',
            'group_join': r'join_group',
            'order_placement': r'menu_orders',
            'payment_submission': r'payment_submit',
            'order_cancellation': r'order_cancel',
            'delivery_tracking': r'track_delivery',
            'refund_request': r'menu_refunds',
            'profile_management': r'menu_profile',
            'address_management': r'menu_addresses',
            'notification_preferences': r'notification_preferences|notif_toggle',
            'help_support': r'menu_help|menu_contact',
            'faq': r'menu_faq',
            'create_group': r'create_group|menu_create_group',
            'group_request_status': r'menu_my_groups',
            'settings': r'menu_settings'
        }
        
        for key, name in features.items():
            pattern = patterns.get(key, key)
            exists = self.grep_file(bot_file, pattern)
            
            if exists:
                self.results['passed'].append(f"Customer Bot: {name}")
                self.print_result('PASS', name)
            else:
                self.results['failed'].append(f"Customer Bot: {name}")
                self.print_result('FAIL', name)
            
            self.results['total'] += 1
    
    def check_admin_bot_features(self):
        self.print_header("👨‍💼 ADMIN BOT FEATURES")
        
        bot_file = self.root / 'apps/admin-bot/src/bot.ts'
        
        features = {
            'dashboard': 'Dashboard',
            'customer_list': 'Customer List',
            'customer_search': 'Customer Search',
            'customer_360': 'Customer 360 View',
            'group_list': 'Group List',
            'group_create': 'Create Group',
            'group_approve': 'Group Approval',
            'bulk_operations': 'Bulk Operations',
            'order_list': 'Order List',
            'order_manage': 'Order Management',
            'payment_list': 'Payment List',
            'payment_verify': 'Payment Verification',
            'refund_list': 'Refund List',
            'refund_approve': 'Refund Approval',
            'refund_complaints': 'Refund Complaints',
            'delivery_list': 'Delivery List',
            'delivery_persons': 'Delivery Person Management',
            'fees_management': 'Fees Management',
            'faq_management': 'FAQ Management',
            'terms_management': 'Terms Management',
            'about_management': 'About Management',
            'bank_management': 'Bank Management',
            'admin_users': 'Admin Users',
            'support_tickets': 'Support Tickets',
            'audit_log': 'Audit Log',
            'notifications': 'Notifications',
            'broadcast': 'Broadcast',
            'reports': 'Reports',
            'export_reports': 'Export Reports',
            'settings': 'Settings',
            'system_health': 'System Health',
            'admin_activity': 'Admin Activity Report'
        }
        
        patterns = {
            'dashboard': r'admin_dashboard',
            'customer_list': r'admin_customers',
            'customer_search': r'customers_search',
            'customer_360': r'customer_360|view_customer',
            'group_list': r'admin_groups',
            'group_create': r'groups_create',
            'group_approve': r'groups_pending|group_approve',
            'bulk_operations': r'bulk_(approve|reject)',
            'order_list': r'admin_orders',
            'order_manage': r'order_status|order_details',
            'payment_list': r'admin_payments',
            'payment_verify': r'payment_confirm|payments_review',
            'refund_list': r'admin_refunds',
            'refund_approve': r'refund_accept|refunds_review',
            'refund_complaints': r'refund_complaints|complaint_',
            'delivery_list': r'admin_delivery',
            'delivery_persons': r'delivery_persons|delivery_driver',
            'fees_management': r'admin_fees',
            'faq_management': r'admin_faq',
            'terms_management': r'admin_terms',
            'about_management': r'admin_about',
            'bank_management': r'admin_banks',
            'admin_users': r'admin_users',
            'support_tickets': r'admin_support',
            'audit_log': r'admin_audit',
            'notifications': r'admin_notifications',
            'broadcast': r'broadcast_analytics|notification_send',
            'reports': r'admin_reports',
            'export_reports': r'report_export|export_',
            'settings': r'admin_settings',
            'system_health': r'system_health',
            'admin_activity': r'admin_activity_report'
        }
        
        for key, name in features.items():
            pattern = patterns.get(key, key)
            exists = self.grep_file(bot_file, pattern)
            
            if exists:
                self.results['passed'].append(f"Admin Bot: {name}")
                self.print_result('PASS', name)
            else:
                self.results['failed'].append(f"Admin Bot: {name}")
                self.print_result('FAIL', name)
            
            self.results['total'] += 1
    
    def check_api_endpoints(self):
        self.print_header("🔌 API ENDPOINTS")
        
        api_file = self.root / 'apps/api/src/server-pg.ts'
        
        endpoints = {
            '/health': 'Health Check',
            '/api/v1/health': 'API Version Health',
            '/api/v1/admin/stats': 'Admin Stats',
            '/api/v1/customers': 'Customer List',
            '/api/v1/customers/register': 'Customer Registration',
            '/api/v1/customers/me': 'Customer Profile',
            '/api/v1/customers/stats': 'Customer Stats',
            '/api/v1/customers/addresses': 'Customer Addresses',
            '/api/v1/customers/groups/request': 'Customer Group Request',
            '/api/v1/customers/groups/requests': 'Customer Group Requests',
            '/api/v1/customers/orders/:id/track': 'Order Tracking',
            '/api/v1/customers/orders/:id/cancel': 'Cancel Order',
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
            '/api/v1/settings': 'Settings',
            '/api/v1/admin/reports/refunds': 'Refund Report',
            '/api/v1/admin/delivery/persons': 'Delivery Persons',
            '/api/v1/admin/refunds/complaints': 'Refund Complaints',
            '/api/v1/admin/broadcast/stats': 'Broadcast Analytics',
            '/api/v1/admin/activity/report': 'Admin Activity'
        }
        
        for endpoint, name in endpoints.items():
            # Escape special characters for regex
            pattern = endpoint.replace('/', '\/').replace(':', '\:').replace('*', '.*')
            exists = self.grep_file(api_file, f'fastify\\.(get|post|put|delete).*{pattern}')
            
            if exists:
                self.results['passed'].append(f"API: {name}")
                self.print_result('PASS', f"{name} ({endpoint})")
            else:
                self.results['failed'].append(f"API: {name}")
                self.print_result('FAIL', f"{name} ({endpoint})")
            
            self.results['total'] += 1
    
    def check_database_models(self):
        self.print_header("🗄️ DATABASE MODELS")
        
        schema_file = self.root / 'apps/api/prisma/schema.prisma'
        
        models = [
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
        
        for model in models:
            exists = self.grep_file(schema_file, f'model {model}')
            
            if exists:
                self.results['passed'].append(f"Database: {model}")
                self.print_result('PASS', model)
            else:
                self.results['failed'].append(f"Database: {model}")
                self.print_result('FAIL', model)
            
            self.results['total'] += 1
    
    def check_notifications(self):
        self.print_header("🔔 NOTIFICATIONS")
        
        api_file = self.root / 'apps/api/src/server-pg.ts'
        customer_file = self.root / 'apps/customer-bot/src/bot.ts'
        admin_file = self.root / 'apps/admin-bot/src/bot.ts'
        
        notifs = {
            'Admin Notification API': (api_file, r'admin/notify'),
            'Customer Registration Trigger': (customer_file, r'admin/notify.*registration'),
            'Payment Trigger': (customer_file, r'admin/notify.*payment'),
            'Refund Trigger': (customer_file, r'admin/notify.*refund'),
            'Admin Notifications View': (admin_file, r'admin_notifications'),
            'Broadcast Analytics': (admin_file, r'broadcast_analytics')
        }
        
        for name, (filepath, pattern) in notifs.items():
            exists = self.grep_file(filepath, pattern)
            
            if exists:
                self.results['passed'].append(f"Notifications: {name}")
                self.print_result('PASS', name)
            else:
                self.results['failed'].append(f"Notifications: {name}")
                self.print_result('FAIL', name)
            
            self.results['total'] += 1
    
    def check_reports(self):
        self.print_header("📊 REPORTS")
        
        admin_file = self.root / 'apps/admin-bot/src/bot.ts'
        api_file = self.root / 'apps/api/src/server-pg.ts'
        
        reports = {
            'Sales Report': (admin_file, r'report_sales'),
            'Order Report': (admin_file, r'report_orders'),
            'Payment Report': (admin_file, r'report_payments'),
            'Customer Report': (admin_file, r'report_customers'),
            'Group Report': (admin_file, r'report_groups'),
            'Refund Report': (admin_file, r'report_refunds'),
            'Delivery Report': (admin_file, r'report_delivery'),
            'Export Reports': (admin_file, r'report_export|export_'),
            'Refund Report API': (api_file, r'/reports/refunds')
        }
        
        for name, (filepath, pattern) in reports.items():
            exists = self.grep_file(filepath, pattern)
            
            if exists:
                self.results['passed'].append(f"Reports: {name}")
                self.print_result('PASS', name)
            else:
                self.results['failed'].append(f"Reports: {name}")
                self.print_result('FAIL', name)
            
            self.results['total'] += 1
    
    def check_security(self):
        self.print_header("🔐 SECURITY")
        
        api_file = self.root / 'apps/api/src/server-pg.ts'
        admin_file = self.root / 'apps/admin-bot/src/bot.ts'
        
        items = {
            'Admin Auth': (admin_file, r'ADMIN_IDS|bot.use.*admin'),
            'RBAC': (admin_file, r'role|permission'),
            'Audit Log': (api_file, r'AuditLog'),
            'Rate Limiting': (api_file, r'rate.?limit'),
            'Input Validation': (api_file, r'zod|validate|schema'),
            'Telegram ID Validation': (admin_file, r'telegramId.*valid|ctx.from')
        }
        
        for name, (filepath, pattern) in items.items():
            exists = self.grep_file(filepath, pattern)
            
            if exists:
                self.results['passed'].append(f"Security: {name}")
                self.print_result('PASS', name)
            else:
                self.results['failed'].append(f"Security: {name}")
                self.print_result('FAIL', name)
            
            self.results['total'] += 1
    
    def check_bilingual(self):
        self.print_header("🌐 BILINGUAL SUPPORT")
        
        customer_i18n = self.root / 'apps/customer-bot/src/i18n'
        admin_file = self.root / 'apps/admin-bot/src/bot.ts'
        
        items = {
            'Customer Bot English': (customer_i18n / 'en.ts', True),
            'Customer Bot Amharic': (customer_i18n / 'am.ts', True),
            'Admin Bot Bilingual': (admin_file, r'አማርኛ|አለ|ቅርጫ')
        }
        
        for name, data in items.items():
            if isinstance(data, tuple):
                filepath, is_file = data
                if is_file:
                    exists = self.file_exists(filepath)
                else:
                    exists = self.grep_file(filepath, data)
            else:
                exists = self.file_exists(data)
            
            if exists:
                self.results['passed'].append(f"Bilingual: {name}")
                self.print_result('PASS', name)
            else:
                self.results['failed'].append(f"Bilingual: {name}")
                self.print_result('FAIL', name)
            
            self.results['total'] += 1
    
    def check_sla_timers(self):
        self.print_header("⏱️ SLA TIMERS")
        
        api_file = self.root / 'apps/api/src/server-pg.ts'
        
        timers = {
            'Payment Verification (1 hour)': r'payment.*timeout|1 hour.*payment',
            'Refund Processing (2 hours)': r'refund.*processing.*timeout|2 hour.*refund',
            'Refund Confirmation (1 hour)': r'refund.*confirmation.*timeout|1 hour.*confirm'
        }
        
        for name, pattern in timers.items():
            exists = self.grep_file(api_file, pattern)
            
            if exists:
                self.results['passed'].append(f"SLA Timers: {name}")
                self.print_result('PASS', name)
            else:
                self.results['failed'].append(f"SLA Timers: {name}")
                self.print_result('FAIL', name)
            
            self.results['total'] += 1
    
    def print_summary(self):
        self.print_header("📊 IMPLEMENTATION SUMMARY")
        
        total = self.results['total']
        passed = len(self.results['passed'])
        failed = len(self.results['failed'])
        
        percentage = (passed / total * 100) if total > 0 else 0
        
        print(f"\n  {GREEN}✅ PASSED:  {passed}{NC}")
        print(f"  {RED}❌ FAILED:  {failed}{NC}")
        print(f"  {BLUE}📊 TOTAL:   {total}{NC}")
        print(f"  {PURPLE}📈 RATE:    {percentage:.1f}%{NC}")
        print()
        
        if passed > 0:
            print(f"{GREEN}✅ IMPLEMENTED FEATURES ({passed}):{NC}")
            for item in self.results['passed'][:20]:
                print(f"  {GREEN}• {item}{NC}")
            if len(self.results['passed']) > 20:
                print(f"  {YELLOW}... and {len(self.results['passed']) - 20} more{NC}")
            print()
        
        if failed > 0:
            print(f"{RED}❌ MISSING FEATURES ({failed}):{NC}")
            for item in self.results['failed'][:20]:
                print(f"  {RED}• {item}{NC}")
            if len(self.results['failed']) > 20:
                print(f"  {YELLOW}... and {len(self.results['failed']) - 20} more{NC}")
            print()
        
        # Overall status
        self.print_header("🎯 OVERALL STATUS")
        if percentage >= 90:
            print(f"\n  {GREEN}✅ EXCELLENT! System is {percentage:.1f}% complete.{NC}")
            print(f"  {GREEN}   Ready for deployment!{NC}")
        elif percentage >= 70:
            print(f"\n  {YELLOW}⚠️ GOOD! System is {percentage:.1f}% complete.{NC}")
            print(f"  {YELLOW}   Some features need implementation.{NC}")
        else:
            print(f"\n  {RED}❌ System is {percentage:.1f}% complete.{NC}")
            print(f"  {RED}   Significant features missing.{NC}")
        
        print(f"\n{BLUE}📅 Check completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}{NC}")
    
    def run(self):
        self.print_header("🔍 ALE KIRCHA - IMPLEMENTATION CHECKER")
        print(f"{BLUE}📁 Project: {self.root}{NC}")
        print(f"{BLUE}📅 Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}{NC}")
        
        self.check_customer_bot_features()
        self.check_admin_bot_features()
        self.check_api_endpoints()
        self.check_database_models()
        self.check_notifications()
        self.check_reports()
        self.check_security()
        self.check_bilingual()
        self.check_sla_timers()
        self.print_summary()
        
        # Save to file
        report = {
            'timestamp': datetime.now().isoformat(),
            'total': self.results['total'],
            'passed': len(self.results['passed']),
            'failed': len(self.results['failed']),
            'passed_items': self.results['passed'],
            'failed_items': self.results['failed']
        }
        
        with open('implementation_report.json', 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"\n{BLUE}📄 Report saved to: implementation_report.json{NC}")

if __name__ == "__main__":
    checker = ImplementationChecker()
    checker.run()
