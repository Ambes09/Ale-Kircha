export const storageService = {
  async uploadFile(file: Buffer, mimeType: string, folder: string = 'advices') {
    // Simplified for now - returns placeholder
    return {
      key: `advice_${Date.now()}`,
      url: `https://storage.example.com/advice_${Date.now()}`
    };
  },

  async deleteFile(key: string) {
    // Placeholder
    return true;
  },

  async getPresignedUrl(key: string) {
    return `https://storage.example.com/${key}`;
  },

  async validateFile(file: any) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    const maxSize = 5 * 1024 * 1024;
    
    if (!allowedTypes.includes(file.mimetype)) {
      return { valid: false, error: 'Invalid file type' };
    }
    if (file.size > maxSize) {
      return { valid: false, error: 'File too large' };
    }
    return { valid: true };
  }
};
