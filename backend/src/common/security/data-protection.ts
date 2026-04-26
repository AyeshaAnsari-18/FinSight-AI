import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';

const ENVELOPE_PREFIX = 'enc:v1';
const ENVELOPE_SEPARATOR = '|';

function getEncryptionKey() {
  const rawKey = process.env.DATA_ENCRYPTION_KEY;

  if (!rawKey || rawKey.trim().length === 0) {
    throw new Error('DATA_ENCRYPTION_KEY is missing. Set it before starting the backend.');
  }

  return createHash('sha256').update(rawKey).digest();
}

function isEncryptedEnvelope(value: string) {
  return value.startsWith(`${ENVELOPE_PREFIX}${ENVELOPE_SEPARATOR}`);
}

function splitEnvelope(value: string) {
  const parts = value.split(ENVELOPE_SEPARATOR);
  if (parts.length !== 4 || parts[0] !== ENVELOPE_PREFIX) {
    throw new Error('Invalid encrypted payload envelope.');
  }

  return {
    iv: Buffer.from(parts[1], 'base64url'),
    tag: Buffer.from(parts[2], 'base64url'),
    ciphertext: Buffer.from(parts[3], 'base64url'),
  };
}

export function encryptText(value: string): string;
export function encryptText(value: string | null): string | null;
export function encryptText(value: null | undefined): null | undefined;
export function encryptText(value: string | null | undefined): string | null | undefined {
  if (value === null || value === undefined) {
    return value;
  }

  if (value === '') {
    return '';
  }

  if (isEncryptedEnvelope(value)) {
    return value;
  }

  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', getEncryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [
    ENVELOPE_PREFIX,
    iv.toString('base64url'),
    tag.toString('base64url'),
    ciphertext.toString('base64url'),
  ].join(ENVELOPE_SEPARATOR);
}

export function decryptText(value: string): string;
export function decryptText(value: string | null): string | null;
export function decryptText(value: null | undefined): null | undefined;
export function decryptText(value: string | null | undefined): string | null | undefined {
  if (value === null || value === undefined) {
    return value;
  }

  if (value === '') {
    return '';
  }

  if (!isEncryptedEnvelope(value)) {
    return value;
  }

  const { iv, tag, ciphertext } = splitEnvelope(value);
  const decipher = createDecipheriv('aes-256-gcm', getEncryptionKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
}

export function encryptBuffer(buffer: Buffer) {
  if (!buffer.length) {
    return Buffer.from('', 'utf8');
  }

  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', getEncryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const tag = cipher.getAuthTag();

  return Buffer.from(
    [
      ENVELOPE_PREFIX,
      iv.toString('base64url'),
      tag.toString('base64url'),
      ciphertext.toString('base64url'),
    ].join(ENVELOPE_SEPARATOR),
    'utf8',
  );
}

export function decryptBuffer(buffer: Buffer) {
  const text = buffer.toString('utf8');

  if (!isEncryptedEnvelope(text)) {
    return buffer;
  }

  const { iv, tag, ciphertext } = splitEnvelope(text);
  const decipher = createDecipheriv('aes-256-gcm', getEncryptionKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

export function encryptJsonValue<T>(value: T) {
  return encryptText(JSON.stringify(value));
}

export function decryptJsonValue<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined) {
    return fallback;
  }

  if (typeof value === 'object' && !Buffer.isBuffer(value)) {
    return value as T;
  }

  if (typeof value !== 'string') {
    return fallback;
  }

  const plain = decryptText(value);

  if (plain === null || plain === undefined) {
    return fallback;
  }

  try {
    return JSON.parse(plain) as T;
  } catch {
    return plain as T;
  }
}
