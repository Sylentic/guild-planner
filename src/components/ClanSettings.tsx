"use client";
import { usePermissions } from '@/hooks/usePermissions';
import { Skeleton } from './ui/Skeleton';

import { useState } from 'react';
import { Webhook, Bell, BellOff, Check, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { testDiscordWebhook } from '@/lib/discord';
import { useLanguage } from '@/contexts/LanguageContext';

interface ClanSettingsProps {
  groupId: string;
  currentWebhookUrl?: string;
  currentWelcomeWebhookUrl?: string;
  notifyOnEvents?: boolean;
  notifyOnAnnouncements?: boolean;
  announcementRoleId?: string;
  scAnnouncementRoleId?: string;
  scEventsRoleId?: string;
  onUpdate?: () => void;
}

export function ClanSettings({
  groupId,
  currentWebhookUrl = '',
  currentWelcomeWebhookUrl = '',
  notifyOnEvents = true,
  notifyOnAnnouncements = true,
  announcementRoleId = '',
  scAnnouncementRoleId = '',
  scEventsRoleId = '',
  onUpdate,
}: ClanSettingsProps) {
  const { loading } = usePermissions(groupId);
  const [webhookUrl, setWebhookUrl] = useState(currentWebhookUrl);
  const [welcomeWebhookUrl, setWelcomeWebhookUrl] = useState(currentWelcomeWebhookUrl);
  const [eventsEnabled, setEventsEnabled] = useState(notifyOnEvents);
  const [announcementsEnabled, setAnnouncementsEnabled] = useState(notifyOnAnnouncements);
  const [roleId, setRoleId] = useState(announcementRoleId);
  const [scAnnouncementRole, setScAnnouncementRole] = useState(scAnnouncementRoleId);
  const [scEventsRole, setScEventsRole] = useState(scEventsRoleId);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const { t } = useLanguage();

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    setTestResult(null);

    try {
      const { error: updateError } = await supabase
        .from('groups')
        .update({
          group_webhook_url: webhookUrl.trim() || null,
          group_welcome_webhook_url: welcomeWebhookUrl.trim() || null,
          notify_on_events: eventsEnabled,
          notify_on_announcements: announcementsEnabled,
          discord_announcement_role_id: roleId.trim() || null,
          sc_announcement_role_id: scAnnouncementRole.trim() || null,
          sc_events_role_id: scEventsRole.trim() || null,
        })
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

  const handleTest = async () => {
    if (!webhookUrl.trim()) {
      setTestResult({ success: false, message: 'Please enter a webhook URL first' });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const result = await testDiscordWebhook(webhookUrl.trim());
      setTestResult({
        success: result.success,
        message: result.success 
          ? 'Webhook test successful! Check your Discord channel.' 
          : result.error || 'Test failed',
      });
    } catch (err) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : 'Test failed',
      });
    } finally {
      setTesting(false);
    }
  };

  const isValidWebhookUrl = (url: string) => {
    return !url || 
      url.startsWith('https://discord.com/api/webhooks/') || 
      url.startsWith('https://discordapp.com/api/webhooks/');
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

      {/* Announcement Role ID */}
      <div>
        <label htmlFor="discord-role-id" className="block text-sm font-medium text-slate-300 mb-2">
          Announcement Role ID (AoC) (Optional)
        </label>
        <input
          id="discord-role-id"
          type="text"
          value={roleId}
          onChange={(e) => setRoleId(e.target.value.replace(/[^0-9]/g, ''))}
          placeholder="123456789012345678"
          className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <p className="text-xs text-slate-500 mt-1">
          Enter the numeric Discord Role ID to ping when posting AoC announcements. Right-click a role {'>'} Copy ID (Developer Mode must be enabled).
        </p>
      </div>

      {/* Star Citizen Announcement Role ID */}
      <div>
        <label htmlFor="sc-announcement-role-id" className="block text-sm font-medium text-slate-300 mb-2">
          Announcement Role ID (Star Citizen) (Optional)
        </label>
        <input
          id="sc-announcement-role-id"
          type="text"
          value={scAnnouncementRole}
          onChange={(e) => setScAnnouncementRole(e.target.value.replace(/[^0-9]/g, ''))}
          placeholder="123456789012345678"
          className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <p className="text-xs text-slate-500 mt-1">
          Enter the numeric Discord Role ID to ping when posting Star Citizen announcements.
        </p>
      </div>

      {/* Star Citizen Events Role ID */}
      <div>
        <label htmlFor="sc-events-role-id" className="block text-sm font-medium text-slate-300 mb-2">
          Events Role ID (Star Citizen) (Optional)
        </label>
        <input
          id="sc-events-role-id"
          type="text"
          value={scEventsRole}
          onChange={(e) => setScEventsRole(e.target.value.replace(/[^0-9]/g, ''))}
          placeholder="123456789012345678"
          className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <p className="text-xs text-slate-500 mt-1">
          Enter the numeric Discord Role ID to ping when posting Star Citizen events.
        </p>
      </div>

      {/* Test button */}
      {webhookUrl && isValidWebhookUrl(webhookUrl) && (
        <button
          onClick={handleTest}
          disabled={testing}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors disabled:opacity-50 cursor-pointer border border-purple-500/30"
        >
          {testing ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              {t('discord.testing')}
            </>
          ) : (
            <>
              <Webhook size={16} />
              {t('discord.testWebhook')}
            </>
          )}
        </button>
      )}

      {/* Test result */}
      {testResult && (
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
