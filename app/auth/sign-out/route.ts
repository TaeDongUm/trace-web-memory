import { NextResponse } from 'next/server';
import { authConfig, sameOrigin } from '@/lib/auth-config';
import { supabaseServer } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const config = authConfig(process.env);
  if (!config) return new Response(null, { status: 503 });
  if (!sameOrigin(request, config.origin)) return new Response(null, { status: 403 });
  const client = (await supabaseServer())!;
  const { error } = await client.auth.signOut({ scope: 'local' });
  return NextResponse.redirect(`${config.origin}${error ? '/home?error=logout' : '/login'}`, { status: 303, headers: { 'Cache-Control': 'private, no-store', 'Clear-Site-Data': '"cache"' } });
}
