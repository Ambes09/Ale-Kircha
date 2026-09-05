import re

with open('src/server-pg.ts', 'r') as f:
    content = f.read()

# Map snake_case to actual database column names (lowercase)
replacements = {
    '"telegram_id"': '"telegramid"',
    '"first_name"': '"firstname"',
    '"last_name"': '"lastname"',
    '"display_order"': '"displayorder"',
    '"question_en"': '"questionen"',
    '"question_am"': '"questionam"',
    '"answer_en"': '"answeren"',
    '"answer_am"': '"answeram"',
    '"bank_name_en"': '"banknameen"',
    '"bank_name_am"': '"banknameam"',
    '"account_name"': '"accountname"',
    '"account_number"': '"accountnumber"',
    '"account_type"': '"accounttype"',
    '"is_active"': '"isactive"',
    '"is_default"': '"isdefault"',
    '"created_at"': '"createdat"',
    '"updated_at"': '"updatedat"',
    '"full_name"': '"fullname"',
    '"delivery_address"': '"deliveryaddress"',
    '"additional_phone"': '"additionalphone"',
    '"preferred_language"': '"preferredlanguage"',
    '"registration_date"': '"registrationdate"',
    '"effective_from"': '"effectivefrom"',
    '"effective_date"': '"effectivedate"',
    '"user_id"': '"userid"',
    '"customer_id"': '"customerid"',
    '"order_id"': '"orderid"',
    '"payment_id"': '"paymentid"',
    '"refund_id"': '"refundid"',
    '"group_id"': '"groupid"',
    '"terms_version_id"': '"termsversionid"',
    '"privacy_version_id"': '"privacyversionid"',
    '"language_used"': '"languageused"',
    '"telegram_user_id"': '"telegramuserid"',
    '"ip_address"': '"ipaddress"',
    '"user_agent"': '"useragent"',
    '"accepted_at"': '"acceptedat"',
    '"refund_request_id"': '"refundrequestid"',
    '"created_by"': '"createdby"',
    '"admin_action_at"': '"adminactionat"',
    '"completed_at"': '"completedat"',
    '"payment_advice_url"': '"paymentadviceurl"',
    '"payment_reference"': '"paymentreference"',
    '"is_deletable"': '"isdeletable"',
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open('src/server-pg.ts', 'w') as f:
    f.write(content)

print("✅ Fixed all column names to match actual database schema")
