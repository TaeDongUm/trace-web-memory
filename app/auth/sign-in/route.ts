import { NextResponse } from 'next/server';
import { authConfig, sameOrigin } from '@/lib/auth-config';
import { supabaseServer } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const config = authConfig(process.env);
  if (!config) return new Response('로그인 연결을 준비하고 있어요.', { status: 503 });
  if (!sameOrigin(request, config.origin)) return new Response(null, { status: 403 });
  const client = (await supabaseServer())!;
  const { data, error } = await client.auth.signInWithOAuth({
    provider: 'google', options: { redirectTo: `${config.origin}/auth/callback` },
  });
  return NextResponse.redirect(error || !data.url ? `${config.origin}/login?error=oauth` : data.url, { status: 303, headers: { 'Cache-Control': 'private, no-store' } });
}
