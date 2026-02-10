-- Migration: Add discord_welcome_webhook_url to clans table
ALTER TABLE clans ADD COLUMN IF NOT EXISTS discord_welcome_webhook_url TEXT;

COMMENT ON COLUMN clans.discord_welcome_webhook_url IS 'Discord webhook URL for welcome messages (optional, falls back to main webhook if not set)';

INSERT INTO migration_history (filename) VALUES ('031_add_discord_welcome_webhook_url.sql');
