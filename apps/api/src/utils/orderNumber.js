export function generateOrderNumber() {
    const now = new Date();
    const date = now.getFullYear().toString() +
        String(now.getMonth() + 1).padStart(2, '0') +
        String(now.getDate()).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
    return `SK-${date}-${random}`;
}
export function generateGroupCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `DK${code}`;
}
