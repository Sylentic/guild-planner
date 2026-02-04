import { supabase } from '@/lib/supabase';

/**
 * Get all enabled games for a group
 */
export async function getGroupGames(groupId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('group_games')
      .select('game_slug')
      .eq('group_id', groupId)
      .order('created_at');

    if (error) throw error;
    return data?.map(row => row.game_slug) || ['aoc']; // Default to AoC if no games
  } catch (err) {
    console.error('Error fetching group games:', err);
    return ['aoc']; // Default fallback
  }
}

/**
 * Add a game to a group (admin only)
 */
export async function addGameToGroup(groupId: string, gameSlug: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('group_games')
      .insert([{ group_id: groupId, game_slug: gameSlug }]);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error adding game to group:', err);
    return false;
  }
}

/**
 * Remove a game from a group (admin only)
 */
export async function removeGameFromGroup(groupId: string, gameSlug: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('group_games')
      .delete()
      .eq('group_id', groupId)
      .eq('game_slug', gameSlug);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error removing game from group:', err);
    return false;
  }
}

