import { createClient } from '@supabase/supabase-js';

// URL e chave públicas do Supabase. Em desenvolvimento, podem vir das variáveis
// de ambiente do Vite (.env). Em produção (Cloudflare Pages), caímos no fallback
// hardcoded — a URL é pública por design (aparece em todas as requisições de
// rede), o que protege os dados é a RLS do banco + a anon key.
const FALLBACK_URL = 'https://xlzwtujulajbuhhulrvw.supabase.co';
const FALLBACK_KEY = 'sb_publishable_9LtWexTO2nMkh6bmEWfxOg_-Lxhnf0O';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || FALLBACK_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || FALLBACK_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  }
});

export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseKey);
};
