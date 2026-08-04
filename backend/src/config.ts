import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: Number(process.env.PORT ?? 5000),
  supabaseUrl: process.env.SUPABASE_URL ?? '',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  openRouterApiKey: process.env.OPENROUTER_API_KEY ?? '',
  openRouterBaseUrl: process.env.OPENROUTER_BASE_URL ?? 'https://openrouter.ai/api/v1',
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',
  adminEmails: (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
  adminDomains: (process.env.ADMIN_DOMAINS ?? '')
    .split(',')
    .map((domain) => domain.trim().toLowerCase())
    .filter(Boolean),
};

const missing: string[] = [];

if (!config.supabaseUrl || !/^https?:\/\//.test(config.supabaseUrl)) missing.push('SUPABASE_URL');
if (!config.supabaseServiceKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');
if (!config.openRouterApiKey) missing.push('OPENROUTER_API_KEY');
if (!config.clientUrl) missing.push('CLIENT_URL');

if (missing.length > 0) {
  console.error(
    `FATAL: Missing required environment variable(s): ${missing.join(', ')}. ` +
      'Set them on the hosting platform or in a .env file.'
  );
  process.exit(1);
}