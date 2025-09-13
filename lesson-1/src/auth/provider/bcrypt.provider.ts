import { Injectable } from '@nestjs/common';
import { HashingProvider } from './hashing.provider';
import bcrypt from 'bcryptjs';

@Injectable()
export class BcryptProvider implements HashingProvider {
  public async hashPassword(password: string): Promise<string> {
    const hashedPassword = await bcrypt.hash(password, 10);

    return hashedPassword;
  }

  public async comparePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    const validPassword = await bcrypt.compare(plainPassword, hashedPassword);

    return validPassword;
  }
}
