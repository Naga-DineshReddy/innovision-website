import { createClient } from '@supabase/supabase-js';

function cleanSupabaseUrl(str?: string): string {
  if (!str) return '';
  let cleaned = str.trim();
  cleaned = cleaned.replace(/\/rest\/v1\/?$/, '');
  cleaned = cleaned.replace(/\/+$/, '');
  return cleaned;
}

function isValidHttpUrl(str?: string): boolean {
  if (!str) return false;
  try {
    const url = new URL(cleanSupabaseUrl(str));
    return (url.protocol === 'http:' || url.protocol === 'https:') && !str.includes('your_supabase');
  } catch {
    return false;
  }
}

const rawUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured: boolean =
  isValidHttpUrl(rawUrl) &&
  Boolean(rawKey && !rawKey.includes('your_supabase') && !rawKey.includes('placeholder') && rawKey.length > 20);

if (!isSupabaseConfigured) {
  console.info(
    'ℹ️ InnoVision running in Demo/Fallback mode. To connect live Supabase, provide valid VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
  );
}

const safeUrl = isValidHttpUrl(rawUrl) ? cleanSupabaseUrl(rawUrl) : 'https://placeholder-project.supabase.co';
const safeKey = rawKey && !rawKey.includes('your_supabase') ? rawKey.trim() : 'placeholder-anon-key';

export const supabase = createClient(safeUrl, safeKey);

