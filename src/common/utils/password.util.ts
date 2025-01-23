import { createHash } from 'crypto';

export class PasswordUtil {
  /**
   * Encrypts a password using SHA1
   * @param password Plain text password
   * @returns SHA1 encrypted password
   */
  static encrypt(password: string): string {
    return createHash('sha1').update(password).digest('hex');
  }

  /**
   * Verifies if a plain text password matches an encrypted password
   * @param plainPassword Plain text password to verify
   * @param encryptedPassword Encrypted password to compare against
   * @returns boolean indicating if passwords match
   */
  static verify(plainPassword: string, encryptedPassword: string): boolean {
    const hashedPassword = this.encrypt(plainPassword);
    return hashedPassword === encryptedPassword;
  }
}
