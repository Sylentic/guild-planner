'use client';

import { useState } from 'react';
import { Webhook, Bell, BellOff, Check, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { testDiscordWebhook } from '@/lib/discord';
import { useLanguage } from '@/contexts/LanguageContext';

interface ClanSettingsProps {
  clanId: string;
  currentWebhookUrl?: string;
  notifyOnEvents?: boolean;
  notifyOnAnnouncements?: boolean;
  announcementRoleId?: string;
  onUpdate?: () => void;
}

export function ClanSettings({
  clanId,
  currentWebhookUrl = '',
  notifyOnEvents = true,
  notifyOnAnnouncements = true,
  announcementRoleId = '',
  onUpdate,
}: ClanSettingsProps) {
  const [webhookUrl, setWebhookUrl] = useState(currentWebhookUrl);
  const [eventsEnabled, setEventsEnabled] = useState(notifyOnEvents);
  const [announcementsEnabled, setAnnouncementsEnabled] = useState(notifyOnAnnouncements);
  const [roleId, setRoleId] = useState(announcementRoleId);
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
        .from('clans')
        .update({
          discord_webhook_url: webhookUrl.trim() || null,
          notify_on_events: eventsEnabled,
          notify_on_announcements: announcementsEnabled,
          discord_announcement_role_id: roleId.trim() || null,
        })
        .eq('id', clanId)
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
        <label className="block text-sm font-medium text-slate-300 mb-2">
          {t('discord.webhookUrl')}
        </label>
        <input
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

      {/* Announcement Role ID */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Announcement Role ID (Optional)
        </label>
        <input
          type="text"
          value={roleId}
          onChange={(e) => setRoleId(e.target.value.replace(/[^0-9]/g, ''))}
          placeholder="123456789012345678"
          className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <p className="text-xs text-slate-500 mt-1">
          Enter the numeric Discord Role ID to ping when posting announcements. Right-click a role {'>'} Copy ID (Developer Mode must be enabled).
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
        <button
          onClick={handleSave}
          disabled={saving || !!(webhookUrl && !isValidWebhookUrl(webhookUrl))}
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
      </div>
    </div>
  );
}
