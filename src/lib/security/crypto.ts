import { createCipheriv, createDecipheriv, randomBytes, createHash } from "node:crypto";

const VERSION = 1;

export function encryptionKeyBytes(env: NodeJS.ProcessEnv = process.env): Buffer | null {
  const raw = env.MDA_DATA_ENCRYPTION_KEY?.trim();
  if (!raw) return null;
  // Aceita 64 hex chars (32 bytes) ou base64 de 32 bytes.
  if (/^[0-9a-fA-F]{64}$/.test(raw)) return Buffer.from(raw, "hex");
  try {
    const buf = Buffer.from(raw, "base64");
    if (buf.length === 32) return buf;
  } catch {
    return null;
  }
  return null;
}

export function requireEncryptionKey(env: NodeJS.ProcessEnv = process.env): Buffer {
  const key = encryptionKeyBytes(env);
  if (!key) throw new Error("MDA_DATA_ENCRYPTION_KEY ausente ou inválida.");
  return key;
}

export function mustEncryptInProduction(env: NodeJS.ProcessEnv = process.env): boolean {
  // Produção real (Vercel Production) ou cobrança em production — não usar NODE_ENV sozinho (build/test).
  return env.VERCEL_ENV === "production" || env.MERCADO_PAGO_MODE === "production";
}

export type EncryptedBlob = {
  v: typeof VERSION;
  iv: string;
  tag: string;
  data: string;
};

export function isEncryptedBlob(value: unknown): value is EncryptedBlob {
  if (!value || typeof value !== "object") return false;
  const blob = value as EncryptedBlob;
  return blob.v === VERSION && typeof blob.iv === "string" && typeof blob.tag === "string" && typeof blob.data === "string";
}

export function encryptJson(value: unknown, env: NodeJS.ProcessEnv = process.env): EncryptedBlob {
  const key = requireEncryptionKey(env);
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const plaintext = Buffer.from(JSON.stringify(value), "utf8");
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    v: VERSION,
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
    data: encrypted.toString("base64"),
  };
}

export function decryptJson<T>(blob: EncryptedBlob, env: NodeJS.ProcessEnv = process.env): T {
  const key = requireEncryptionKey(env);
  const iv = Buffer.from(blob.iv, "base64");
  const tag = Buffer.from(blob.tag, "base64");
  const data = Buffer.from(blob.data, "base64");
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([decipher.update(data), decipher.final()]);
  return JSON.parse(plaintext.toString("utf8")) as T;
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}
