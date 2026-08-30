export function normalizePhone(phone) {
    let cleaned = phone.replace(/[^0-9+]/g, '');
    if (cleaned.startsWith('0')) {
        cleaned = '+251' + cleaned.slice(1);
    }
    else if (!cleaned.startsWith('+')) {
        cleaned = '+251' + cleaned;
    }
    return cleaned;
}
export function validateEthiopianPhone(phone) {
    const normalized = normalizePhone(phone);
    return /^\+251[79][0-9]{8}$/.test(normalized);
}
