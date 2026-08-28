import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import { env } from '../config/env.js';

class StorageService {
  private s3Client: S3Client | null = null;
  private bucket: string = '';

  constructor() {
    if (env.S3_ENDPOINT && env.S3_ACCESS_KEY && env.S3_SECRET_KEY) {
      this.s3Client = new S3Client({
        endpoint: env.S3_ENDPOINT,
        region: env.S3_REGION || 'us-east-1',
        credentials: {
          accessKeyId: env.S3_ACCESS_KEY,
          secretAccessKey: env.S3_SECRET_KEY,
        },
        forcePathStyle: true,
      });
      this.bucket = env.S3_BUCKET || 'siga-kircha';
    }
  }

  async uploadFile(file: Buffer, mimeType: string, folder: string = 'advices'): Promise<{ key: string; url: string }> {
    const key = `${folder}/${randomUUID()}`;
    
    if (this.s3Client) {
      await this.s3Client.send(new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file,
        ContentType: mimeType,
        ACL: 'public-read',
      }));
      
      const url = `${env.S3_ENDPOINT}/${this.bucket}/${key}`;
      return { key, url };
    } else {
      // Fallback: store locally (development only)
      const fs = await import('fs');
      const path = await import('path');
      const uploadDir = path.join(process.cwd(), 'uploads', folder);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const filePath = path.join(uploadDir, `${key}.${mimeType.split('/')[1] || 'png'}`);
      fs.writeFileSync(filePath, file);
      const url = `http://localhost:4000/uploads/${folder}/${key}.${mimeType.split('/')[1] || 'png'}`;
      return { key, url };
    }
  }

  async deleteFile(key: string): Promise<void> {
    if (this.s3Client) {
      await this.s3Client.send(new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }));
    }
  }

  async getPresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    if (this.s3Client) {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      return await getSignedUrl(this.s3Client, command, { expiresIn });
    }
    return '';
  }

  async validateFile(file: any): Promise<{ valid: boolean; error?: string }> {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    const maxSize = env.PAYMENT_ADVICE_MAX_SIZE || 5 * 1024 * 1024;
    
    if (!allowedTypes.includes(file.mimetype)) {
      return { valid: false, error: 'Invalid file type. Allowed: JPEG, PNG, WEBP, PDF' };
    }
    if (file.size > maxSize) {
      return { valid: false, error: `File size exceeds ${maxSize / 1024 / 1024}MB limit` };
    }
    return { valid: true };
  }
}

export const storageService = new StorageService();
