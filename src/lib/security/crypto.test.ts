import { afterEach, describe, expect, it } from "vitest";
import {
  decryptJson,
  encryptJson,
  encryptionKeyBytes,
  mustEncryptInProduction,
  requireEncryptionKey,
} from "./crypto";

const KEY_HEX = "a".repeat(64);

afterEach(() => {
  delete process.env.MDA_DATA_ENCRYPTION_KEY;
  delete process.env.VERCEL_ENV;
  delete process.env.MERCADO_PAGO_MODE;
});

describe("criptografia AES-256-GCM", () => {
  it("cifra e decifra com IV diferente para o mesmo conteúdo", () => {
    process.env.MDA_DATA_ENCRYPTION_KEY = KEY_HEX;
    const a = encryptJson({ name: "Ana" });
    const b = encryptJson({ name: "Ana" });
    expect(a.iv).not.toBe(b.iv);
    expect(a.data).not.toBe(b.data);
    expect(decryptJson<{ name: string }>(a).name).toBe("Ana");
    expect(decryptJson<{ name: string }>(b).name).toBe("Ana");
    expect(JSON.stringify(a)).not.toContain("Ana");
  });

  it("detecta adulteração do ciphertext", () => {
    process.env.MDA_DATA_ENCRYPTION_KEY = KEY_HEX;
    const blob = encryptJson({ secret: "x" });
    const tampered = { ...blob, data: Buffer.from("ffff", "hex").toString("base64") };
    expect(() => decryptJson(tampered)).toThrow();
  });

  it("rejeita chave inválida", () => {
    process.env.MDA_DATA_ENCRYPTION_KEY = "curta";
    expect(encryptionKeyBytes()).toBeNull();
    expect(() => requireEncryptionKey()).toThrow(/MDA_DATA_ENCRYPTION_KEY/);
  });

  it("exige chave em produção", () => {
    delete process.env.MDA_DATA_ENCRYPTION_KEY;
    process.env.VERCEL_ENV = "production";
    expect(mustEncryptInProduction()).toBe(true);
    expect(() => requireEncryptionKey()).toThrow();
  });
});
