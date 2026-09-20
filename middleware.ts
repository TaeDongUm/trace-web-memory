import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { authConfig } from '@/lib/auth-config';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const config = authConfig(process.env);
  if (config) {
    const client = createServerClient(config.url, config.key, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(values) {
          values.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          values.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    });
    // Verified by Auth; never authorize requests from an unverified getSession().
    await client.auth.getUser();
  }
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}

export const config = { matcher: ['/home/:path*', '/login', '/save/:path*', '/import/:path*', '/api/memories/:path*'] };
