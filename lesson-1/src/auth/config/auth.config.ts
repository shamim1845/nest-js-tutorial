import { registerAs } from '@nestjs/config';

export const authConfig = registerAs('auth', () => ({
  secretKey: String(process.env.SECRET_KEY || 'default_secret_key'),
}));
