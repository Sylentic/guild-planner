import { GameId } from '@/lib/games';
import { supabase } from '@/lib/supabase';

/**
 * Middleware helper to ensure a clan belongs to the correct game
 * Use in protected routes to validate game context
 */
export async function validateClanGame(
  groupId: string,
  expectedGameId: GameId
): Promise<boolean> {
  const { data, error } = await supabase
    .from('groups')
    .select('game')
    .eq('id', groupId)
    .single();

  if (error || !data) {
    console.error('Error validating clan game:', error);
    return false;
  }

  return data.game === expectedGameId;
}

/**
 * Get the game a clan belongs to
 */
export async function getClanGame(groupId: string): Promise<GameId | null> {
  const { data, error } = await supabase
    .from('groups')
    .select('game')
    .eq('id', groupId)
    .single();

  if (error || !data) {
    console.error('Error fetching clan game:', error);
    return null;
  }

  return data.game as GameId;
}

/**
 * Initialize a clan with a specific game
 * Called when creating a new clan
 */
export async function initializeClanWithGame(
  groupId: string,
  gameId: GameId,
  userId: string
): Promise<void> {
  // Update clan with game
  const { error: clanError } = await supabase
    .from('groups')
    .update({ game: gameId })
    .eq('id', groupId);

  if (clanError) {
    console.error('Error setting clan game:', clanError);
    throw clanError;
  }

  // Track user's participation in this game
  try {
    await supabase.from('user_games').insert({
      user_id: userId,
      game: gameId,
    });
  } catch (err) {
    // User might already be tracked for this game, ignore
    console.debug('User game tracking info:', err);
  }
}

