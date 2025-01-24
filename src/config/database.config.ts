import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'passkeys',
  password: process.env.DB_PASSWORD || 'passkeys',
  database: process.env.DB_DATABASE || 'passkeys_db',
  entities: ['dist/**/*.entity{.ts,.js}'],
  // synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV !== 'production',
}));
