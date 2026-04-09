import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "default-encryption-key-32-chars!!!";
const CIPHER_ALGORITHM = "aes-256-cbc";

export function encryptBiometricData(data: string): string {
  try {
    const iv = crypto.randomBytes(16);
    const key = crypto
      .createHash("sha256")
      .update(ENCRYPTION_KEY)
      .digest();
    const cipher = crypto.createCipheriv(CIPHER_ALGORITHM, key, iv);
    let encrypted = cipher.update(data, "utf8", "hex");
    encrypted += cipher.final("hex");
    return iv.toString("hex") + ":" + encrypted;
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Failed to encrypt biometric data");
  }
}

export function decryptBiometricData(encryptedData: string): string {
  try {
    const [ivHex, encrypted] = encryptedData.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const key = crypto
      .createHash("sha256")
      .update(ENCRYPTION_KEY)
      .digest();
    const decipher = crypto.createDecipheriv(CIPHER_ALGORITHM, key, iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt biometric data");
  }
}

export function generateBiometricTemplate(): string {
  // In a real system, this would come from a biometric scanner
  // For now, we'll generate a mock template
  return crypto.randomBytes(64).toString("hex");
}
