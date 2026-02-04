import { NextRequest, NextResponse } from 'next/server';

/**
 * Simple auth redirect passthrough.
 * Supabase redirects here, we just pass through to auth/callback
 * which will use getURL() to redirect to the correct domain.
 */
export async function GET(request: NextRequest) {
  // Redirect to the auth callback page
  // The callback page uses getURL() to ensure we're on the correct domain
  return NextResponse.redirect(new URL('/auth/callback', request.nextUrl.origin), 307);
}

