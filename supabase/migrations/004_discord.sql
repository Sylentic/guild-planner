-- Migration 004: Discord Webhooks
-- Adds webhook URL support for clan notifications

-- Add discord webhook URL to clans table
ALTER TABLE clans ADD COLUMN discord_webhook_url TEXT;

-- Add notification preferences
ALTER TABLE clans ADD COLUMN notify_on_events BOOLEAN DEFAULT true;
ALTER TABLE clans ADD COLUMN notify_on_announcements BOOLEAN DEFAULT true;

-- Comment for clarity
COMMENT ON COLUMN clans.discord_webhook_url IS 'Discord webhook URL for clan notifications';
COMMENT ON COLUMN clans.notify_on_events IS 'Whether to send Discord notifications for new events';
COMMENT ON COLUMN clans.notify_on_announcements IS 'Whether to send Discord notifications for announcements';
