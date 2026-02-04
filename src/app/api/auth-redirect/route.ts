import { NextRequest, NextResponse } from 'next/server';

/**
 * This route acts as an OAuth redirect intermediary.
 * Discord/Supabase redirects here (which is on the production domain),
 * and we redirect to the appropriate final destination based on the dev flag.
 */
export async function GET(request: NextRequest) {
  const isDev = request.nextUrl.searchParams.get('dev') === 'true';
  
  if (isDev) {
    // Redirect to dev domain callback
    return NextResponse.redirect('https://dev.gp.pandamonium-gaming.com/auth/callback', 307);
  }
  
  // Redirect to production callback
  return NextResponse.redirect('https://aoc.pandamonium-gaming.com/auth/callback', 307);
}

