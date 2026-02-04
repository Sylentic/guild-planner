import { supabase } from '@/lib/supabase';

/**
 * Get all enabled games for a group
 * Returns all available games if none have been explicitly configured
 */
export async function getGroupGames(groupId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('group_games')
      .select('game_slug')
      .eq('group_id', groupId)
      .order('created_at');

    if (error) throw error;
    
    // If games are configured, return them; otherwise return empty array
    // (The calling code will handle showing all games if array is empty)
    return data?.map(row => row.game_slug) || [];
  } catch (err) {
    console.error('Error fetching group games:', err);
    return []; // Return empty array, let caller decide default behavior
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

