import { createClient, type SupabaseClientOptions } from '@supabase/supabase-js';
import WebSocket from 'ws';
import { config } from '../config';

type RealtimeTransport = NonNullable<
  SupabaseClientOptions<'public'>['realtime']
>['transport'];

const wsTransport = WebSocket as unknown as RealtimeTransport;

export const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  realtime: {
    transport: wsTransport,
  },
});