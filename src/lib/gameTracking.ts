import { supabase } from '@/lib/supabase';
import { GameId } from '@/lib/games';

/**
 * Track which games a user participates in
 */
export async function addUserGame(userId: string, gameId: GameId) {
  const { error } = await supabase
    .from('user_games')
    .upsert(
      {
        user_id: userId,
        game: gameId,
      },
      { onConflict: 'user_id,game' }
    );

  if (error) {
    console.error('Error adding user game:', error);
    throw error;
  }
}

/**
 * Get all games a user is in
 */
export async function getUserGames(userId: string): Promise<GameId[]> {
  const { data, error } = await supabase
    .from('user_games')
    .select('game')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching user games:', error);
    return [];
  }

  return (data?.map((row: any) => row.game) || []) as GameId[];
}

/**
 * Get a user's clans for a specific game
 */
export async function getUserClansForGame(
  userId: string,
  gameId: GameId
): Promise<any[]> {
  const { data, error } = await supabase
    .from('clan_members')
    .select(
      `
      clan_id,
      role,
      is_creator,
      clans (
        id,
        slug,
        name,
        game,
        guild_icon_url
      )
    `
    )
    .eq('user_id', userId)
    .eq('clans.game', gameId);

  if (error) {
    console.error('Error fetching clans:', error);
    return [];
  }

  return (
    data?.map((row: any) => ({
      id: row.clans.id,
      slug: row.clans.slug,
      name: row.clans.name,
      game: row.clans.game,
      role: row.role,
      isCreator: row.is_creator,
      guild_icon_url: row.clans.guild_icon_url,
    })) || []
  );
}
