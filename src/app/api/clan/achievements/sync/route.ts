import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Supabase client with service role for accurate counts
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface AchievementProgress {
  achievement_id: string;
  current_value: number;
  is_unlocked: boolean;
}

async function calculateAchievementProgress(
  clanId: string
): Promise<AchievementProgress[]> {
  try {
    // Define all achievement calculations
    const calculations: Record<string, () => Promise<number>> = {
      // Milestone achievements - based on member count
      '': async () => {
        const { count } = await supabaseAdmin
          .from('clan_members')
          .select('id', { count: 'exact', head: true })
          .eq('clan_id', clanId);
        return count || 0;
      },

      // PvP achievements - based on siege wins
      'siege_wins': async () => {
        const { data: sieges } = await supabaseAdmin
          .from('siege_events')
          .select('id')
          .eq('clan_id', clanId)
          .eq('result', 'win');
        return sieges?.length || 0;
      },

      // Economy achievements
      'bank_deposits': async () => {
        const { count } = await supabaseAdmin
          .from('guild_bank_transactions')
          .select('id', { count: 'exact', head: true })
          .eq('clan_id', clanId)
          .eq('transaction_type', 'deposit');
        return count || 0;
      },

      'caravan_complete': async () => {
        const { count } = await supabaseAdmin
          .from('caravans')
          .select('id', { count: 'exact', head: true })
          .eq('clan_id', clanId)
          .eq('status', 'completed');
        return count || 0;
      },

      'grandmaster_count': async () => {
        // Get grandmaster count from characters with grandmaster professions
        const { data: characters } = await supabaseAdmin
          .from('characters')
          .select('id, professions')
          .eq('clan_id', clanId);

        const grandmasters = new Set<string>();
        for (const char of characters || []) {
          if (char.professions) {
            const profs = typeof char.professions === 'string' 
              ? JSON.parse(char.professions)
              : char.professions;
            if (Array.isArray(profs)) {
              for (const prof of profs) {
                const profName = typeof prof === 'string' ? prof : prof.name;
                if (profName?.toLowerCase().includes('grandmaster')) {
                  grandmasters.add(char.id);
                }
              }
            }
          }
        }
        return grandmasters.size;
      },

      // Community achievements
      'events_hosted': async () => {
        const { count } = await supabaseAdmin
          .from('events')
          .select('id', { count: 'exact', head: true })
          .eq('clan_id', clanId);
        return count || 0;
      },

      'weekly_active': async () => {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const { data: activities } = await supabaseAdmin
          .from('activity_log')
          .select('user_id')
          .eq('clan_id', clanId)
          .gte('created_at', oneWeekAgo.toISOString());

        const uniqueUsers = new Set(activities?.map(a => a.user_id) || []);
        return uniqueUsers.size;
      },
    };

    // Map requirement types to calculations
    const requirementTypeToCalculation: Record<string, string> = {
      'member_count': 'member_count',
      'siege_wins': 'siege_wins',
      'bank_deposits': 'bank_deposits',
      'caravan_complete': 'caravan_complete',
      'grandmaster_count': 'grandmaster_count',
      'events_hosted': 'events_hosted',
      'weekly_active': 'weekly_active',
    };

    // Fetch all definitions
    const { data: definitions } = await supabaseAdmin
      .from('achievement_definitions')
      .select('id, requirement_type, requirement_value');

    if (!definitions) return [];

    const progress: AchievementProgress[] = [];

    for (const def of definitions) {
      const calcKey = requirementTypeToCalculation[def.requirement_type];
      const calculation = calculations[calcKey];

      if (!calculation) {
        console.warn(`No calculation for requirement type: ${def.requirement_type}`);
        continue;
      }

      const currentValue = await calculation();
      const isUnlocked = currentValue >= def.requirement_value;

      progress.push({
        achievement_id: def.id,
        current_value: currentValue,
        is_unlocked: isUnlocked,
      });
    }

    return progress;
  } catch (error) {
    console.error('Error calculating achievements:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get auth token from header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { clanId } = await request.json();

    if (!clanId) {
      return NextResponse.json(
        { error: 'Missing clanId' },
        { status: 400 }
      );
    }

    // Verify user is admin/officer of the clan
    const { data: membership } = await supabaseAdmin
      .from('clan_members')
      .select('role')
      .eq('clan_id', clanId)
      .eq('user_id', user.id)
      .single();

    if (!membership || !['admin', 'officer'].includes(membership.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Calculate achievement progress
    const progress = await calculateAchievementProgress(clanId);

    // Upsert achievements with calculated values
    for (const achievement of progress) {
      const { error: upsertError } = await supabaseAdmin
        .from('clan_achievements')
        .upsert(
          {
            clan_id: clanId,
            achievement_id: achievement.achievement_id,
            current_value: achievement.current_value,
            is_unlocked: achievement.is_unlocked,
            unlocked_at: achievement.is_unlocked 
              ? new Date().toISOString() 
              : null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'clan_id,achievement_id' }
        );

      if (upsertError) {
        console.error('Error upserting achievement:', upsertError);
      }
    }

    return NextResponse.json({
      success: true,
      updated: progress.length,
      achievements: progress,
    });
  } catch (error) {
    console.error('Sync achievements error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
