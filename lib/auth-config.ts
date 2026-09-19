export function authConfig(env: Record<string, string | undefined>) {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const site = env.SITE_URL;
  if (!url || !key || !site || !key.startsWith('sb_publishable_')) return null;
  try {
    const backend = new URL(url);
    const origin = new URL(site);
    const local = ['localhost', '127.0.0.1'].includes(origin.hostname);
    if (backend.protocol !== 'https:' || backend.username || backend.password || backend.search || backend.hash || backend.pathname !== '/') return null;
    if ((origin.protocol !== 'https:' && !(local && origin.protocol === 'http:')) || origin.username || origin.password || origin.pathname !== '/' || origin.search || origin.hash) return null;
    return { url: backend.origin, key, origin: origin.origin };
  } catch { return null; }
}

export function sameOrigin(request: Request, origin: string) {
  return request.headers.get('origin') === origin;
}
