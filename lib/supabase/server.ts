import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { authConfig } from '@/lib/auth-config';

export async function supabaseServer() {
  const config = authConfig(process.env);
  if (!config) return null;
  const jar = await cookies();
  return createServerClient(config.url, config.key, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll(values) {
        // Server Components cannot write cookies; middleware refreshes them.
        try { values.forEach(({ name, value, options }) => jar.set(name, value, options)); } catch {}
      },
    },
  });
}
