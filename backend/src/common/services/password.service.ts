import { Injectable } from '@nestjs/common';
import { pbkdf2Sync, randomBytes, timingSafeEqual } from 'crypto';

@Injectable()
export class PasswordService {
  private readonly iterations = 600000;
  private readonly keyLength = 64;
  private readonly digest = 'sha512';

  hash(rawPassword: string): string {
    const salt = randomBytes(16).toString('hex');
    const derived = pbkdf2Sync(rawPassword, salt, this.iterations, this.keyLength, this.digest).toString('hex');
    return `pbkdf2$${this.iterations}$${salt}$${derived}`;
  }

  verify(rawPassword: string, storedPassword: string): boolean {
    const parts = storedPassword.split('$');
    if (parts.length !== 4 || parts[0] !== 'pbkdf2') {
      return false;
    }

    const iterations = Number(parts[1]);
    const salt = parts[2];
    const hash = parts[3];
    const derived = pbkdf2Sync(rawPassword, salt, iterations, hash.length / 2, this.digest);
    const storedBuffer = Buffer.from(hash, 'hex');
    return storedBuffer.length === derived.length && timingSafeEqual(storedBuffer, derived);
  }
}

