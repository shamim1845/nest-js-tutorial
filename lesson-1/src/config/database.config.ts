import { registerAs } from '@nestjs/config';

export const databaseConfig = registerAs('database', () => ({
  host: String(process.env.DB_HOST || 'localhost'),
  port: Number(process.env.DB_PORT || 5432),
  name: String(process.env.DB_NAME),
  username: String(process.env.DB_USER_NAME),
  password: String(process.env.DB_PASSWORD),
  syncronize: process.env.DB_SYNC === 'true',
  autoLoadEntities: process.env.DB_AUTO_LOAD_ENTITIES === 'true',
}));
