import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
    return null;
  }

  if (!key) {
    console.error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
    return null;
  }

  return createClient(url, key);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const groupId = searchParams.get('group_id');
  const gameSlug = searchParams.get('game_slug') || 'aoc';

  if (!groupId) {
    return NextResponse.json({ error: 'Missing group_id' }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json({
      error: 'Server not properly configured. Missing Supabase credentials (SUPABASE_SERVICE_ROLE_KEY).'
    }, { status: 500 });
  }

  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorised - no auth header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorised - no token' }, { status: 401 });
    }

    const userClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { user }, error: authError } = await userClient.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorised - invalid or expired token' }, { status: 401 });
    }

    const { data: membership } = await supabaseAdmin
      .from('group_members')
      .select('role')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden - not a group member' }, { status: 403 });
    }

    const { data: characters, error: charactersError } = await supabaseAdmin
      .from('members')
      .select('id, group_id, user_id, name, race, primary_archetype, secondary_archetype, level, is_main, created_at')
      .eq('group_id', groupId)
      .eq('game_slug', gameSlug)
      .order('is_main', { ascending: false })
      .order('name');

    if (charactersError) {
      console.error('Error fetching characters:', charactersError);
      return NextResponse.json({ error: 'Failed to load characters' }, { status: 500 });
    }

    const charactersWithProfessions = (characters || []).map((char) => ({
      ...char,
      professions: [],
    }));

    const characterIds = charactersWithProfessions.map((char) => char.id);

    let ships: unknown[] = [];
    if (characterIds.length > 0) {
      const { data: shipsData, error: shipsError } = await supabaseAdmin
        .from('character_ships')
        .select('*')
        .in('character_id', characterIds);

      if (shipsError) {
        console.error('Error fetching character ships:', shipsError);
        return NextResponse.json({ error: 'Failed to load ships' }, { status: 500 });
      }

      ships = shipsData || [];
    }

    return NextResponse.json({
      characters: charactersWithProfessions,
      ships,
    });
  } catch (error) {
    console.error('Error fetching ships overview:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
