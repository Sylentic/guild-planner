"use client";
import { usePermissions } from '@/hooks/usePermissions';
import { Skeleton } from './ui/Skeleton';
import { getAllGames } from '@/lib/games';
import { GAME_DISCORD_COLUMNS, GameId } from '@/lib/discordConfig';

import { useState } from 'react';
import { Webhook, Bell, BellOff, Check, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { testDiscordWebhook } from '@/lib/discord';
import { useLanguage } from '@/contexts/LanguageContext';

interface ClanSettingsProps {
  groupId: string;
  gameSlug?: string;
  currentWebhookUrl?: string;
  currentWelcomeWebhookUrl?: string;
  currentAocWebhookUrl?: string;
  currentAocEventsWebhookUrl?: string;
  currentScWebhookUrl?: string;
  currentScEventsWebhookUrl?: string;
  currentRorWebhookUrl?: string;
  currentRorEventsWebhookUrl?: string;
  notifyOnEvents?: boolean;
  notifyOnAnnouncements?: boolean;
  announcementRoleId?: string;
  aocAnnouncementRoleId?: string;
  aocEventsRoleId?: string;
  scAnnouncementRoleId?: string;
  scEventsRoleId?: string;
  rorAnnouncementRoleId?: string;
  rorEventsRoleId?: string;
  aocWelcomeEnabled?: boolean;
  scWelcomeEnabled?: boolean;
  onUpdate?: () => void;
}

export function ClanSettings({
  groupId,
  gameSlug = 'aoc',
  currentWebhookUrl = '',
  currentWelcomeWebhookUrl = '',
  currentAocWebhookUrl = '',
  currentAocEventsWebhookUrl = '',
  currentScWebhookUrl = '',
  currentScEventsWebhookUrl = '',
  currentRorWebhookUrl = '',
  currentRorEventsWebhookUrl = '',
  notifyOnEvents = true,
  notifyOnAnnouncements = true,
  announcementRoleId = '',
  aocAnnouncementRoleId = '',
  aocEventsRoleId = '',
  scAnnouncementRoleId = '',
  scEventsRoleId = '',
  rorAnnouncementRoleId = '',
  rorEventsRoleId = '',
  aocWelcomeEnabled = true,
  scWelcomeEnabled = true,
  onUpdate,
}: ClanSettingsProps) {
  const { loading } = usePermissions(groupId);
  const games = getAllGames();

  // Legacy webhook support
  const [webhookUrl, setWebhookUrl] = useState(currentWebhookUrl);
  const [welcomeWebhookUrl, setWelcomeWebhookUrl] = useState(currentWelcomeWebhookUrl);

  // Game-specific webhooks and roles
  const [gameConfig, setGameConfig] = useState<
    Record<GameId, {
      webhookUrl: string;
      eventsWebhookUrl: string;
      announcementRoleId: string;
      eventsRoleId: string;
    }>
  >({
    aoc: {
      webhookUrl: currentAocWebhookUrl,
      eventsWebhookUrl: currentAocEventsWebhookUrl,
      announcementRoleId: aocAnnouncementRoleId || announcementRoleId,
      eventsRoleId: aocEventsRoleId,
    },
    starcitizen: {
      webhookUrl: currentScWebhookUrl,
      eventsWebhookUrl: currentScEventsWebhookUrl,
      announcementRoleId: scAnnouncementRoleId,
      eventsRoleId: scEventsRoleId,
    },
    ror: {
      webhookUrl: currentRorWebhookUrl,
      eventsWebhookUrl: currentRorEventsWebhookUrl,
      announcementRoleId: rorAnnouncementRoleId,
      eventsRoleId: rorEventsRoleId,
    },
  });

  const [eventsEnabled, setEventsEnabled] = useState(notifyOnEvents);
  const [announcementsEnabled, setAnnouncementsEnabled] = useState(notifyOnAnnouncements);
  const [aocWelcomeEnabledState, setAocWelcomeEnabledState] = useState(aocWelcomeEnabled);
  const [scWelcomeEnabledState, setScWelcomeEnabledState] = useState(scWelcomeEnabled);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; game?: string } | null>(null);
  const { t } = useLanguage();

  const updateGameConfig = (gameId: GameId, field: string, value: string) => {
    setGameConfig(prev => ({
      ...prev,
      [gameId]: {
        ...prev[gameId],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    setTestResult(null);

    try {
      const updateData: Record<string, any> = {
        group_webhook_url: webhookUrl.trim() || null,
        group_welcome_webhook_url: welcomeWebhookUrl.trim() || null,
        notify_on_events: eventsEnabled,
        notify_on_announcements: announcementsEnabled,
        aoc_welcome_enabled: aocWelcomeEnabledState,
        sc_welcome_enabled: scWelcomeEnabledState,
      };

      // Add game-specific webhooks and roles
      Object.entries(gameConfig).forEach(([gameId, config]) => {
        const columns = GAME_DISCORD_COLUMNS[gameId as GameId];
        updateData[columns.webhookUrl] = config.webhookUrl.trim() || null;
        updateData[columns.eventsWebhookUrl] = config.eventsWebhookUrl.trim() || null;
        updateData[columns.announcementRoleId] = config.announcementRoleId.trim() || null;
        updateData[columns.eventsRoleId] = config.eventsRoleId.trim() || null;
      });

      // Legacy support: sync AoC role to old column
      updateData.discord_announcement_role_id = gameConfig.aoc.announcementRoleId.trim() || null;

      const { error: updateError } = await supabase
        .from('groups')
        .update(updateData)
        .eq('id', groupId)
        .select();

      if (updateError) throw updateError;

      setSaved(true);
      onUpdate?.();
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async (gameId: GameId) => {
    const webhookToTest = gameConfig[gameId].eventsWebhookUrl || gameConfig[gameId].webhookUrl;
    
    if (!webhookToTest.trim()) {
      setTestResult({ success: false, message: `Please enter a webhook URL for ${gameId} first`, game: gameId });
      return;
    }

    setTesting(gameId);
    setTestResult(null);

    try {
      const result = await testDiscordWebhook(webhookToTest.trim());
      setTestResult({
        success: result.success,
        message: result.success 
          ? `Webhook test successful for ${gameId}! Check your Discord channel.` 
          : result.error || 'Test failed',
        game: gameId,
      });
    } catch (err) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : 'Test failed',
        game: gameId,
      });
    } finally {
      setTesting(null);
    }
  };

  const isValidWebhookUrl = (url: string) => {
    return !url || 
      url.startsWith('https://discord.com/api/webhooks/') || 
      url.startsWith('https://discordapp.com/api/webhooks/');
  };

  const getGameName = (gameId: GameId) => {
    const game = games.find(g => g.id === gameId);
    return game?.name || gameId;
  };

  const getGameIcon = (gameId: GameId) => {
    const game = games.find(g => g.id === gameId);
    return game?.icon || '⚙️';
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg border border-slate-700 p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Webhook className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">{t('discord.integration')}</h3>
      </div>

      {/* Webhook URL */}
      <div>
        <label htmlFor="discord-webhook-url" className="block text-sm font-medium text-slate-300 mb-2">
          {t('discord.webhookUrl')}
        </label>
        <input
          id="discord-webhook-url"
          type="url"
          value={webhookUrl}
          onChange={(e) => setWebhookUrl(e.target.value)}
          placeholder={t('discord.webhookPlaceholder')}
          className={`w-full px-3 py-2 bg-slate-800 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
            webhookUrl && !isValidWebhookUrl(webhookUrl) 
              ? 'border-red-500' 
              : 'border-slate-600'
          }`}
        />
        {webhookUrl && !isValidWebhookUrl(webhookUrl) && (
          <p className="text-xs text-red-400 mt-1">
            {t('discord.invalidWebhook')}
          </p>
        )}
        <p className="text-xs text-slate-500 mt-1">
          {t('discord.webhookHint')}
        </p>
      </div>

      {/* Welcome Webhook URL */}
      <div>
        <label htmlFor="discord-welcome-webhook-url" className="block text-sm font-medium text-slate-300 mb-2">
          Welcome Webhook URL (Optional)
        </label>
        <input
          id="discord-welcome-webhook-url"
          type="url"
          value={welcomeWebhookUrl}
          onChange={(e) => setWelcomeWebhookUrl(e.target.value)}
          placeholder="https://discord.com/api/webhooks/... (for welcome messages)"
          className={`w-full px-3 py-2 bg-slate-800 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
            welcomeWebhookUrl && !isValidWebhookUrl(welcomeWebhookUrl) 
              ? 'border-red-500' 
              : 'border-slate-600'
          }`}
        />
        {welcomeWebhookUrl && !isValidWebhookUrl(welcomeWebhookUrl) && (
          <p className="text-xs text-red-400 mt-1">
            Invalid Discord webhook URL
          </p>
        )}
        <p className="text-xs text-slate-500 mt-1">
          If set, new member welcome messages will be sent to this webhook. Otherwise, the main webhook is used.
        </p>
      </div>

      {/* Game-Specific Configuration Sections */}
      <div className="border-t border-slate-700 pt-6 space-y-8">
        <h4 className="text-base font-semibold text-slate-300 mb-4">
          Game-Specific Discord Webhooks & Roles
        </h4>

        {games.map((game) => (
          <div key={game.id} className="bg-slate-800/30 border border-slate-700 rounded-lg p-4 space-y-4">
            <h5 className="font-semibold text-slate-200">
              {getGameIcon(game.id as GameId)} {game.name}
            </h5>

            {/* General Webhook */}
            <div>
              <label htmlFor={`webhook-${game.id}`} className="block text-sm font-medium text-slate-300 mb-2">
                General Webhook URL
              </label>
              <input
                id={`webhook-${game.id}`}
                type="url"
                value={gameConfig[game.id as GameId].webhookUrl}
                onChange={(e) => updateGameConfig(game.id as GameId, 'webhookUrl', e.target.value)}
                placeholder="https://discord.com/api/webhooks/..."
                className={`w-full px-3 py-2 bg-slate-800 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  gameConfig[game.id as GameId].webhookUrl && !isValidWebhookUrl(gameConfig[game.id as GameId].webhookUrl) 
                    ? 'border-red-500' 
                    : 'border-slate-600'
                }`}
              />
              {gameConfig[game.id as GameId].webhookUrl && !isValidWebhookUrl(gameConfig[game.id as GameId].webhookUrl) && (
                <p className="text-xs text-red-400 mt-1">Invalid Discord webhook URL</p>
              )}
              <p className="text-xs text-slate-500 mt-1">
                Used for announcements and other general messages
              </p>
            </div>

            {/* Events Webhook */}
            <div>
              <label htmlFor={`events-webhook-${game.id}`} className="block text-sm font-medium text-slate-300 mb-2">
                Events Webhook URL (Optional)
              </label>
              <input
                id={`events-webhook-${game.id}`}
                type="url"
                value={gameConfig[game.id as GameId].eventsWebhookUrl}
                onChange={(e) => updateGameConfig(game.id as GameId, 'eventsWebhookUrl', e.target.value)}
                placeholder="https://discord.com/api/webhooks/... (leave empty to use general webhook)"
                className={`w-full px-3 py-2 bg-slate-800 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  gameConfig[game.id as GameId].eventsWebhookUrl && !isValidWebhookUrl(gameConfig[game.id as GameId].eventsWebhookUrl) 
                    ? 'border-red-500' 
                    : 'border-slate-600'
                }`}
              />
              {gameConfig[game.id as GameId].eventsWebhookUrl && !isValidWebhookUrl(gameConfig[game.id as GameId].eventsWebhookUrl) && (
                <p className="text-xs text-red-400 mt-1">Invalid Discord webhook URL</p>
              )}
              <p className="text-xs text-slate-500 mt-1">
                If set, event notifications will be sent to this webhook instead of the general one
              </p>
            </div>

            {/* Announcement Role */}
            <div>
              <label htmlFor={`announcement-role-${game.id}`} className="block text-sm font-medium text-slate-300 mb-2">
                Announcement Role ID (Optional)
              </label>
              <input
                id={`announcement-role-${game.id}`}
                type="text"
                value={gameConfig[game.id as GameId].announcementRoleId}
                onChange={(e) => updateGameConfig(game.id as GameId, 'announcementRoleId', e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="123456789012345678"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-slate-500 mt-1">
                Role to ping when posting announcements. Right-click role in Discord {'>'}  Copy ID (Developer Mode required)
              </p>
            </div>

            {/* Events Role */}
            <div>
              <label htmlFor={`events-role-${game.id}`} className="block text-sm font-medium text-slate-300 mb-2">
                Events Role ID (Optional)
              </label>
              <input
                id={`events-role-${game.id}`}
                type="text"
                value={gameConfig[game.id as GameId].eventsRoleId}
                onChange={(e) => updateGameConfig(game.id as GameId, 'eventsRoleId', e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="123456789012345678"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-slate-500 mt-1">
                Role to ping when creating or reminding about events
              </p>
            </div>

            {/* Test Button */}
            {(gameConfig[game.id as GameId].eventsWebhookUrl || gameConfig[game.id as GameId].webhookUrl) && 
             (isValidWebhookUrl(gameConfig[game.id as GameId].eventsWebhookUrl) || isValidWebhookUrl(gameConfig[game.id as GameId].webhookUrl)) && (
              <button
                onClick={() => handleTest(game.id as GameId)}
                disabled={testing === game.id}
                className="flex items-center gap-2 px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors disabled:opacity-50 cursor-pointer border border-purple-500/30 text-sm"
              >
                {testing === game.id ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Webhook size={14} />
                    Test Webhook
                  </>
                )}
              </button>
            )}

            {/* Test Result for this game */}
            {testResult?.game === game.id && (
              <div className={`flex items-start gap-2 p-3 rounded-lg ${
                testResult.success 
                  ? 'bg-green-500/10 border border-green-500/30 text-green-400' 
                  : 'bg-red-500/10 border border-red-500/30 text-red-400'
              }`}>
                {testResult.success ? <Check size={16} /> : <AlertCircle size={16} />}
                <span className="text-sm">{testResult.message}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Test result for legacy webhook */}
      {testResult && testResult.game === undefined && (
        <div className={`flex items-start gap-2 p-3 rounded-lg ${
          testResult.success 
            ? 'bg-green-500/10 border border-green-500/30 text-green-400'
            : 'bg-red-500/10 border border-red-500/30 text-red-400'
        }`}>
          {testResult.success ? <Check size={16} /> : <AlertCircle size={16} />}
          <span className="text-sm">{testResult.message}</span>
        </div>
      )}

      {/* Notification toggles */}
      <div className="space-y-3">
        <label className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors">
          <div className="flex items-center gap-3">
            <Bell size={18} className={eventsEnabled ? 'text-green-400' : 'text-slate-500'} />
            <div>
              <span className="text-white text-sm font-medium">{t('discord.eventNotifications')}</span>
              <p className="text-xs text-slate-500">{t('discord.eventNotificationsDesc')}</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={eventsEnabled}
            onChange={(e) => setEventsEnabled(e.target.checked)}
            className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-purple-500 focus:ring-purple-500 cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors">
          <div className="flex items-center gap-3">
            {announcementsEnabled ? (
              <Bell size={18} className="text-green-400" />
            ) : (
              <BellOff size={18} className="text-slate-500" />
            )}
            <div>
              <span className="text-white text-sm font-medium">{t('discord.announcementNotifications')}</span>
              <p className="text-xs text-slate-500">{t('discord.announcementNotificationsDesc')}</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={announcementsEnabled}
            onChange={(e) => setAnnouncementsEnabled(e.target.checked)}
            className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-purple-500 focus:ring-purple-500 cursor-pointer"
          />
        </label>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
          <AlertCircle size={16} />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Save button */}
      <div className="flex justify-end">
        {loading ? (
          <Skeleton className="h-10 w-32" />
        ) : (
          <button
            onClick={handleSave}
            disabled={
              saving ||
              !!(webhookUrl && !isValidWebhookUrl(webhookUrl)) ||
              !!(welcomeWebhookUrl && !isValidWebhookUrl(welcomeWebhookUrl))
            }
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {t('discord.saving')}
              </>
            ) : saved ? (
              <>
                <Check size={16} />
                {t('discord.saved')}
              </>
            ) : (
              t('discord.saveSettings')
            )}
          </button>
        )}
      </div>
    </div>
  );
}

