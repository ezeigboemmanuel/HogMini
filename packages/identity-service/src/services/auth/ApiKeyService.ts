import crypto from 'crypto';
import { pool } from '../../config/database';
import { ApiKeyRepository } from '../../Repositories/ApiKeyRepository';

export class ApiKeyService {
  static async generateApiKey(projectId: string, name: string) {
    const randomHex = crypto.randomBytes(32).toString('hex');
    const plaintextKey = `hogmini_${randomHex}`;
    const keyHash = crypto.createHash('sha256').update(plaintextKey).digest('hex');
    const keyPrefix = plaintextKey.substring(0, 8);

    const client = await pool.connect();
    try {
      await ApiKeyRepository.create(client, name, projectId, keyHash, keyPrefix);

      return {
        plaintextKey,
        message: 'Store this key safely. You will not be able to see it again.'
      };
    } finally {
      client.release();
    }
  }
}