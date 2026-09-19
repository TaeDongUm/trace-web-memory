import { NextResponse } from 'next/server';
import { authConfig } from '@/lib/auth-config';
import { supabaseServer } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const config = authConfig(process.env);
  if (!config) return new Response('로그인 연결을 준비하고 있어요.', { status: 503 });
  const params = new URL(request.url).searchParams;
  const code = params.get('code');
  let target = '/login?error=oauth';
  if (code && !params.has('error')) {
    const client = (await supabaseServer())!;
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (!error) target = '/home';
  }
  // No caller-controlled redirect destination or OAuth error details.
  return NextResponse.redirect(`${config.origin}${target}`, { status: 303, headers: { 'Cache-Control': 'private, no-store' } });
}
