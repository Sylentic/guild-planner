/**
 * Discord Webhook Integration
 * 
 * Send notifications to Discord channels via webhooks.
 * No bot required - just paste the webhook URL from Discord.
 */

import { Event, Announcement, EVENT_TYPES } from './events';

interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number;
  fields?: { name: string; value: string; inline?: boolean }[];
  footer?: { text: string };
  timestamp?: string;
  url?: string;
}

interface DiscordWebhookPayload {
  content?: string;
  username?: string;
  avatar_url?: string;
  embeds?: DiscordEmbed[];
}

// Color palette for Discord embeds (decimal format)
const COLORS = {
  orange: 0xf97316, // Primary app color
  green: 0x22c55e,
  red: 0xef4444,
  yellow: 0xeab308,
  cyan: 0x06b6d4,
  purple: 0xa855f7,
  rose: 0xf43f5e,
} as const;

// Event type colors
const EVENT_TYPE_COLORS: Record<string, number> = {
  raid: COLORS.red,
  siege: COLORS.orange,
  gathering: COLORS.yellow,
  social: COLORS.green,
  other: COLORS.cyan,
};

/**
 * Send a message to a Discord webhook via our API proxy
 */
export async function sendDiscordWebhook(
  webhookUrl: string,
  payload: DiscordWebhookPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate URL format
    if (!webhookUrl.startsWith('https://discord.com/api/webhooks/') && 
        !webhookUrl.startsWith('https://discordapp.com/api/webhooks/')) {
      return { success: false, error: 'Invalid Discord webhook URL format' };
    }

    // Use our API proxy to avoid CORS issues
    const response = await fetch('/api/discord', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        webhookUrl,
        payload: {
          username: payload.username || '⚔️ AoC Guild Planner',
          avatar_url: payload.avatar_url,
          content: payload.content,
          embeds: payload.embeds,
        },
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.error || `API error: ${response.status}` };
    }

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Test a Discord webhook URL
 */
export async function testDiscordWebhook(
  webhookUrl: string
): Promise<{ success: boolean; error?: string }> {
  return sendDiscordWebhook(webhookUrl, {
    embeds: [{
      title: '✅ Webhook Connected!',
      description: 'Your Discord webhook is working correctly. You will receive notifications for events and announcements from your guild.',
      color: COLORS.green,
      footer: {
        text: 'AoC Guild Profession Planner',
      },
      timestamp: new Date().toISOString(),
    }],
  });
}

/**
 * Send a notification for a new event
 */
export async function notifyNewEvent(
  webhookUrl: string,
  event: Event,
  clanName: string
): Promise<{ success: boolean; error?: string }> {
  const eventType = EVENT_TYPES[event.event_type];
  const startsAt = new Date(event.starts_at);
  
  const fields: { name: string; value: string; inline?: boolean }[] = [
    {
      name: '📅 When',
      value: `<t:${Math.floor(startsAt.getTime() / 1000)}:F>`,
      inline: true,
    },
  ];

  if (event.location) {
    fields.push({
      name: '📍 Location',
      value: event.location,
      inline: true,
    });
  }

  if (event.max_attendees) {
    fields.push({
      name: '👥 Max Attendees',
      value: event.max_attendees.toString(),
      inline: true,
    });
  }

  if (event.description) {
    fields.push({
      name: '📝 Description',
      value: event.description.length > 200 
        ? event.description.slice(0, 200) + '...' 
        : event.description,
      inline: false,
    });
  }

  return sendDiscordWebhook(webhookUrl, {
    content: '🆕 **New Event Created!**',
    embeds: [{
      title: `${eventType.icon} ${event.title}`,
      description: `Type: **${eventType.name}**`,
      color: EVENT_TYPE_COLORS[event.event_type] || COLORS.cyan,
      fields,
      footer: {
        text: clanName,
      },
      timestamp: new Date().toISOString(),
    }],
  });
}

/**
 * Send a notification for a new announcement
 */
export async function notifyAnnouncement(
  webhookUrl: string,
  announcement: Announcement,
  clanName: string,
  clanSlug: string,
  roleId?: string | null
): Promise<{ success: boolean; error?: string }> {
  // Build content with role ping if provided
  let content = announcement.is_pinned ? '📌 **Pinned Announcement**' : '📢 **New Announcement**';
  if (roleId) {
    content = `<@&${roleId}> ${content}`;
  }

  // Build direct link to announcement
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '');
  const announcementUrl = `${baseUrl}/${clanSlug}?tab=events#announcement-${announcement.id}`;

  return sendDiscordWebhook(webhookUrl, {
    content,
    embeds: [{
      title: announcement.title,
      description: announcement.content.length > 1000 
        ? announcement.content.slice(0, 1000) + '...' 
        : announcement.content,
      color: announcement.is_pinned ? COLORS.orange : COLORS.cyan,
      url: announcementUrl,
      footer: {
        text: clanName,
      },
      timestamp: new Date().toISOString(),
    }],
  });
}

/**
 * Send a notification for an upcoming event (reminder)
 */
export async function notifyEventReminder(
  webhookUrl: string,
  event: Event,
  clanName: string,
  minutesUntil: number
): Promise<{ success: boolean; error?: string }> {
  const eventType = EVENT_TYPES[event.event_type];
  const startsAt = new Date(event.starts_at);

  let timeText = '';
  if (minutesUntil <= 60) {
    timeText = `${minutesUntil} minutes`;
  } else {
    const hours = Math.floor(minutesUntil / 60);
    timeText = `${hours} hour${hours > 1 ? 's' : ''}`;
  }

  return sendDiscordWebhook(webhookUrl, {
    content: `⏰ **Event Starting in ${timeText}!**`,
    embeds: [{
      title: `${eventType.icon} ${event.title}`,
      description: `Starts <t:${Math.floor(startsAt.getTime() / 1000)}:R>`,
      color: COLORS.yellow,
      fields: event.location ? [{
        name: '📍 Location',
        value: event.location,
        inline: true,
      }] : undefined,
      footer: {
        text: clanName,
      },
    }],
  });
}
