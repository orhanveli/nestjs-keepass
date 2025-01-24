import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TotpEntity } from './entities/totp.entity';
import { UserEntity } from './entities/user.entity';
import * as crypto from 'crypto';
import * as base32 from 'hi-base32';

@Injectable()
export class TotpService {
  constructor(
    @InjectRepository(TotpEntity)
    private readonly totpRepository: Repository<TotpEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  /**
   * Generate TOTP secret for a user
   */
  async generateTotpSecret(
    user: UserEntity,
  ): Promise<{ secretKey: string; uri: string }> {
    const secret = crypto.randomBytes(20).toString('hex');
    const base32Secret = base32
      .encode(Buffer.from(secret, 'hex'))
      .replace(/=/g, '');

    const totp = this.totpRepository.create({
      user,
      secretKey: base32Secret,
      backupCodes: this.generateBackupCodes(),
    });

    await this.totpRepository.save(totp);

    const uri = this.generateTotpUri(user.email, base32Secret);
    return { secretKey: base32Secret, uri };
  }

  /**
   * Verify TOTP code
   */
  async verifyTotpCode(user: UserEntity, code: string): Promise<boolean> {
    const totp = await this.totpRepository.findOne({
      where: { user: { id: user.id }, verified: true },
    });

    if (!totp) return false;

    const isValid = this.verifyCode(totp.secretKey, code);
    if (isValid) {
      totp.lastUsedAt = new Date();
      await this.totpRepository.save(totp);
    }

    return isValid;
  }

  /**
   * Enable TOTP for user
   */
  async enableTotp(user: UserEntity, code: string): Promise<boolean> {
    const totp = await this.totpRepository.findOne({
      where: { user: { id: user.id }, verified: false },
    });

    if (!totp) return false;

    const isValid = this.verifyCode(totp.secretKey, code);
    if (isValid) {
      totp.verified = true;
      totp.lastUsedAt = new Date();
      await this.totpRepository.save(totp);

      user.totpEnabled = true;
      await this.userRepository.save(user);
    }

    return isValid;
  }

  /**
   * Verify backup code
   */
  async verifyBackupCode(user: UserEntity, code: string): Promise<boolean> {
    const totp = await this.totpRepository.findOne({
      where: { user: { id: user.id }, verified: true },
    });

    if (!totp || !totp.backupCodes) return false;

    const index = totp.backupCodes.indexOf(code);
    if (index === -1) return false;

    // Remove used backup code
    totp.backupCodes.splice(index, 1);
    await this.totpRepository.save(totp);

    return true;
  }

  private generateTotpUri(email: string, secret: string): string {
    const issuer = 'YourApp';
    const encodedIssuer = encodeURIComponent(issuer);
    const encodedEmail = encodeURIComponent(email);
    return `otpauth://totp/${encodedIssuer}:${encodedEmail}?secret=${secret}&issuer=${encodedIssuer}`;
  }

  private generateBackupCodes(count = 8): string[] {
    return Array.from({ length: count }, () =>
      crypto.randomBytes(4).toString('hex').toUpperCase(),
    );
  }

  private verifyCode(secret: string, code: string): boolean {
    const window = 1; // Allow 30 seconds clock drift
    const counter = Math.floor(Date.now() / 30000);

    for (let i = -window; i <= window; i++) {
      const expectedCode = this.generateCode(secret, counter + i);
      if (expectedCode === code) return true;
    }

    return false;
  }

  private generateCode(secret: string, counter: number): string {
    const decodedSecret = base32.decode.asBytes(secret);
    const buffer = Buffer.alloc(8);
    for (let i = 0; i < 8; i++) {
      buffer[7 - i] = counter & 0xff;
      counter = counter >> 8;
    }

    const hmac = crypto.createHmac('sha1', Buffer.from(decodedSecret));
    const hmacResult = hmac.update(buffer).digest();

    const offset = hmacResult[hmacResult.length - 1] & 0xf;
    const code =
      ((hmacResult[offset] & 0x7f) << 24) |
      ((hmacResult[offset + 1] & 0xff) << 16) |
      ((hmacResult[offset + 2] & 0xff) << 8) |
      (hmacResult[offset + 3] & 0xff);

    return (code % 1000000).toString().padStart(6, '0');
  }

  async findByUser(userId: string): Promise<TotpEntity[]> {
    return this.totpRepository.find({
      where: { user: { id: userId } },
    });
  }
}
