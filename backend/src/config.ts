import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: Number(process.env.PORT ?? 5000),
  supabaseUrl: process.env.SUPABASE_URL ?? '',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  openRouterApiKey: process.env.OPENROUTER_API_KEY ?? '',
  openRouterBaseUrl: process.env.OPENROUTER_BASE_URL ?? 'https://openrouter.ai/api/v1',
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',
};

if (!config.supabaseUrl || !config.supabaseServiceKey) {
  console.warn('WARN: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing in .env - auth and storage will fail.');
}

if (!config.openRouterApiKey) {
  console.warn('WARN: OPENROUTER_API_KEY missing in .env - chat completions will fail.');
}
