import { createHash } from 'crypto';

export const ADMIN_COOKIE_NAME = 'djvolts_admin';

export function getAdminSessionValue() {
 const secret =
  process.env.ADMIN_SECRET_KEY ||
  process.env.SECRET_KEY ||
  process.env.DATABASE_URL;

 if (!secret) {
  throw new Error(
   'ADMIN_SECRET_KEY, SECRET_KEY, or DATABASE_URL must be configured.'
  );
 }

 return createHash('sha256').update(secret).digest('hex');
}
