import { registerAs } from '@nestjs/config';

export const authConfig = registerAs('auth', () => ({
  secret: String(process.env.JWT_SECRET_KEY),
  expiresIn: parseInt(String(process.env.JWT_EXPIRESIN ?? 3600), 10),
  audience: String(process.env.JWT_AUDIENCE),
  issuer: String(process.env.JWT_ISSUER),
}));
