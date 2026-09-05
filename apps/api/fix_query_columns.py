import re

with open('src/server-pg.ts', 'r') as f:
    content = f.read()

# Map camelCase to snake_case for database columns
replacements = {
    '"isActive"': '"is_active"',
    '"displayOrder"': '"display_order"',
    '"createdAt"': '"created_at"',
    '"updatedAt"': '"updated_at"',
    '"firstName"': '"first_name"',
    '"lastName"': '"last_name"',
    '"telegramId"': '"telegram_id"',
    '"customerId"': '"customer_id"',
    '"groupId"': '"group_id"',
    '"orderId"': '"order_id"',
    '"paymentId"': '"payment_id"',
    '"refundId"': '"refund_id"',
    '"userId"': '"user_id"',
    '"bankNameEn"': '"bank_name_en"',
    '"bankNameAm"': '"bank_name_am"',
    '"accountName"': '"account_name"',
    '"accountNumber"': '"account_number"',
    '"questionEn"': '"question_en"',
    '"questionAm"': '"question_am"',
    '"answerEn"': '"answer_en"',
    '"answerAm"': '"answer_am"',
    '"fullName"': '"full_name"',
    '"deliveryAddress"': '"delivery_address"',
    '"additionalPhone"': '"additional_phone"',
    '"preferredLanguage"': '"preferred_language"',
    '"registrationDate"': '"registration_date"',
    '"effectiveFrom"': '"effective_from"',
    '"effectiveDate"': '"effective_date"',
    '"termsVersionId"': '"terms_version_id"',
    '"privacyVersionId"': '"privacy_version_id"',
    '"languageUsed"': '"language_used"',
    '"telegramUserId"': '"telegram_user_id"',
    '"ipAddress"': '"ip_address"',
    '"userAgent"': '"user_agent"',
    '"acceptedAt"': '"accepted_at"',
    '"refundRequestId"': '"refund_request_id"',
    '"createdBy"': '"created_by"',
    '"adminActionAt"': '"admin_action_at"',
    '"completedAt"': '"completed_at"',
    '"paymentAdviceUrl"': '"payment_advice_url"',
    '"paymentReference"': '"payment_reference"',
    '"accountType"': '"account_type"',
    '"isDefault"': '"is_default"',
    '"isDeletable"': '"is_deletable"',
}

for camel, snake in replacements.items():
    content = content.replace(camel, snake)

with open('src/server-pg.ts', 'w') as f:
    f.write(content)

print("✅ Fixed all column names from camelCase to snake_case")
