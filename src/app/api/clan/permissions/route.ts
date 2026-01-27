import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ClanRole } from '@/lib/permissions';

// Get Supabase service role client for server-side operations
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

export type PermissionOverrides = {
  id: string;
  clan_id: string;
  role: ClanRole;
  characters_create: boolean;
  characters_read_all: boolean;
  characters_edit_own: boolean;
  characters_edit_any: boolean;
  characters_delete_own: boolean;
  characters_delete_any: boolean;
  guild_bank_withdraw: boolean;
  guild_bank_deposit: boolean;
  guild_bank_view_history: boolean;
  events_create: boolean;
  events_read: boolean;
  events_edit_own: boolean;
  events_edit_any: boolean;
  events_delete_own: boolean;
  events_delete_any: boolean;
  events_rsvp: boolean;
  parties_create: boolean;
  parties_read: boolean;
  parties_edit_own: boolean;
  parties_edit_any: boolean;
  parties_delete_own: boolean;
  parties_delete_any: boolean;
  siege_view_rosters: boolean;
  siege_edit_rosters: boolean;
  siege_create_event: boolean;
  announcements_create: boolean;
  announcements_edit: boolean;
  announcements_delete: boolean;
  recruitment_manage: boolean;
  settings_edit: boolean;
  settings_edit_roles: boolean;
  settings_view_permissions: boolean;
  created_at: string;
  updated_at: string;
};

// GET: Fetch permission overrides for a clan
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const clanId = searchParams.get('clan_id');

  if (!clanId) {
    return NextResponse.json({ error: 'Missing clan_id' }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    console.error('Supabase admin client initialization failed - check environment variables');
    return NextResponse.json({ 
      error: 'Server not properly configured. Missing Supabase credentials (SUPABASE_SERVICE_ROLE_KEY).' 
    }, { status: 500 });
  }

  try {
    // Verify user is admin
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized - no auth header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized - no token' }, { status: 401 });
    }

    // Create a client with the user's token to verify they exist
    const userClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Verify token by calling getUser with the token
    const { data: { user }, error: authError } = await userClient.auth.getUser(token);
    
    if (authError || !user) {
      console.error('User auth verification failed:', { 
        error: authError?.message, 
        code: authError?.code,
        hasUser: !!user
      });
      return NextResponse.json({ 
        error: 'Unauthorized - invalid or expired token'
      }, { status: 401 });
    }

    // Check if user is admin
    const { data: membership } = await supabaseAdmin
      .from('clan_members')
      .select('role')
      .eq('clan_id', clanId)
      .eq('user_id', user.id)
      .single();

    if (!membership || membership.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - user is not an admin' }, { status: 403 });
    }

    // Fetch permission overrides - may not exist if table hasn't been created yet
    const { data, error } = await supabaseAdmin
      .from('clan_permission_overrides')
      .select('*')
      .eq('clan_id', clanId)
      .order('role', { ascending: true });

    if (error) {
      // If table doesn't exist yet (migration not applied), just return empty
      if (error.code === 'PGRST116' || error.message?.includes('relation')) {
        console.warn('clan_permission_overrides table not found, returning empty defaults');
        return NextResponse.json({ permissions: [] });
      }
      console.error('Error fetching permissions:', error);
      return NextResponse.json({ error: 'Failed to fetch permissions', details: error.message }, { status: 500 });
    }

    return NextResponse.json({ permissions: data || [] });
  } catch (error) {
    console.error('Error in GET /api/clan/permissions:', error);
    return NextResponse.json({ error: 'Internal server error', details: String(error) }, { status: 500 });
  }
}

// POST: Save permission overrides for a clan
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clanId, rolePermissions } = body;

    if (!clanId || !rolePermissions) {
      return NextResponse.json({ error: 'Missing required fields: clanId and rolePermissions' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      console.error('Supabase admin client initialization failed - check environment variables');
      return NextResponse.json({ 
        error: 'Server not properly configured. Missing Supabase credentials (SUPABASE_SERVICE_ROLE_KEY).' 
      }, { status: 500 });
    }

    // Verify user is admin of the clan
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: membership } = await supabaseAdmin
      .from('clan_members')
      .select('role')
      .eq('clan_id', clanId)
      .eq('user_id', user.id)
      .single();

    if (!membership || membership.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - user is not an admin' }, { status: 403 });
    }

    // Save each role's permissions
    const updates = Object.entries(rolePermissions).map(([role, permissions]) => {
      const permsRecord = permissions as Record<string, boolean>;
      return {
        clan_id: clanId,
        role,
        ...permsRecord,
        updated_at: new Date().toISOString(),
      };
    });

    console.log('Saving permissions:', { 
      clanId, 
      updateCount: updates.length,
      roles: updates.map(u => u.role),
      firstUpdate: updates[0] ? Object.keys(updates[0]).length + ' fields' : 'none'
    });

    let result;
    try {
      result = await supabaseAdmin
        .from('clan_permission_overrides')
        .upsert(updates);
    } catch (upsertException) {
      console.error('Exception during upsert:', upsertException);
      throw upsertException;
    }

    const { error: upsertError } = result;

    if (upsertError) {
      console.error('Upsert error response:', { 
        code: upsertError.code,
        message: upsertError.message,
        details: (upsertError as any).details,
        hint: (upsertError as any).hint
      });
      
      // If table doesn't exist yet (migration not applied)
      if (upsertError.code === 'PGRST116' || upsertError.message?.includes('relation') || upsertError.message?.includes('does not exist')) {
        return NextResponse.json({ 
          error: 'Permission system not yet initialized. Please run database migrations.' 
        }, { status: 503 });
      }
      
      return NextResponse.json({ 
        error: 'Failed to save permissions', 
        details: upsertError.message,
        code: upsertError.code
      }, { status: 500 });
    }

    console.log('Permissions saved successfully');
    return NextResponse.json({ success: true, saved: updates.length });
  } catch (error) {
    console.error('Error in POST /api/clan/permissions:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      type: error instanceof Error ? error.constructor.name : typeof error
    });
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
