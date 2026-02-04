/**
 * Game-Specific Discord Configuration
 * 
 * Provides utilities to get Discord webhooks and roles based on the game.
 * Each game can have separate channels for announcements and events.
 */

export type GameId = 'aoc' | 'starcitizen' | 'ror';

export interface GameDiscordConfig {
  webhookUrl?: string | null;
  eventsWebhookUrl?: string | null;
  announcementRoleId?: string | null;
  eventsRoleId?: string | null;
}

/**
 * Get Discord webhook URL for a specific game
 * Falls back to legacy general webhook if game-specific not set
 */
export function getGameWebhookUrl(
  gameSlug: GameId,
  groupData: any
): string | null {
  switch (gameSlug) {
    case 'aoc':
      return groupData?.aoc_webhook_url || groupData?.group_webhook_url || null;
    case 'starcitizen':
      return groupData?.sc_webhook_url || groupData?.group_webhook_url || null;
    case 'ror':
      return groupData?.ror_webhook_url || groupData?.group_webhook_url || null;
    default:
      return groupData?.group_webhook_url || null;
  }
}

/**
 * Get Discord webhook URL specifically for events
 * Falls back to general webhook if no events-specific webhook
 */
export function getGameEventsWebhookUrl(
  gameSlug: GameId,
  groupData: any
): string | null {
  switch (gameSlug) {
    case 'aoc':
      return groupData?.aoc_events_webhook_url || groupData?.aoc_webhook_url || groupData?.group_webhook_url || null;
    case 'starcitizen':
      return groupData?.sc_events_webhook_url || groupData?.sc_webhook_url || groupData?.group_webhook_url || null;
    case 'ror':
      return groupData?.ror_events_webhook_url || groupData?.ror_webhook_url || groupData?.group_webhook_url || null;
    default:
      return groupData?.group_webhook_url || null;
  }
}

/**
 * Get Discord role ID for announcements in a specific game
 */
export function getGameAnnouncementRoleId(
  gameSlug: GameId,
  groupData: any
): string | null {
  switch (gameSlug) {
    case 'aoc':
      return groupData?.aoc_announcement_role_id || groupData?.discord_announcement_role_id || null;
    case 'starcitizen':
      return groupData?.sc_announcement_role_id || null;
    case 'ror':
      return groupData?.ror_announcement_role_id || null;
    default:
      return null;
  }
}

/**
 * Get Discord role ID for event notifications in a specific game
 */
export function getGameEventsRoleId(
  gameSlug: GameId,
  groupData: any
): string | null {
  switch (gameSlug) {
    case 'aoc':
      return groupData?.aoc_events_role_id || null;
    case 'starcitizen':
      return groupData?.sc_events_role_id || null;
    case 'ror':
      return groupData?.ror_events_role_id || null;
    default:
      return null;
  }
}

/**
 * Get all Discord configuration for a game
 */
export function getGameDiscordConfig(
  gameSlug: GameId,
  groupData: any
): GameDiscordConfig {
  return {
    webhookUrl: getGameWebhookUrl(gameSlug, groupData),
    eventsWebhookUrl: getGameEventsWebhookUrl(gameSlug, groupData),
    announcementRoleId: getGameAnnouncementRoleId(gameSlug, groupData),
    eventsRoleId: getGameEventsRoleId(gameSlug, groupData),
  };
}

/**
 * Map of database column names for each game
 * Useful for bulk updates
 */
export const GAME_DISCORD_COLUMNS: Record<GameId, {
  webhookUrl: string;
  eventsWebhookUrl: string;
  announcementRoleId: string;
  eventsRoleId: string;
}> = {
  aoc: {
    webhookUrl: 'aoc_webhook_url',
    eventsWebhookUrl: 'aoc_events_webhook_url',
    announcementRoleId: 'aoc_announcement_role_id',
    eventsRoleId: 'aoc_events_role_id',
  },
  starcitizen: {
    webhookUrl: 'sc_webhook_url',
    eventsWebhookUrl: 'sc_events_webhook_url',
    announcementRoleId: 'sc_announcement_role_id',
    eventsRoleId: 'sc_events_role_id',
  },
  ror: {
    webhookUrl: 'ror_webhook_url',
    eventsWebhookUrl: 'ror_events_webhook_url',
    announcementRoleId: 'ror_announcement_role_id',
    eventsRoleId: 'ror_events_role_id',
  },
};
