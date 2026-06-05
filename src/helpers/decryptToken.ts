import crypto from 'crypto';

export function decryptToken(
  encryptedToken: string,
  ALGORITHM: string,
  FRONT_ENCRYPTION_KEY: string,
) {
  const key = crypto.createHash('sha256').update(FRONT_ENCRYPTION_KEY).digest();
  const [ivHex, encrypted] = encryptedToken.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
