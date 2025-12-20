'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Globe, Save, Check, ArrowLeft, User, Languages } from 'lucide-react';
import { useAuthContext } from '@/components/AuthProvider';
import { useLanguage, LANGUAGES } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';
import { COMMON_TIMEZONES } from '@/lib/events';

export default function SettingsPage() {
  const { user, profile, loading } = useAuthContext();
  const { language, setLanguage, t } = useLanguage();
  const [timezone, setTimezone] = useState('UTC');
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize from profile
  useEffect(() => {
    if (profile) {
      setTimezone(profile.timezone || 'UTC');
      setDisplayName(profile.display_name || '');
    }
  }, [profile]);

  // Auto-detect timezone
  const detectTimezone = () => {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimezone(detected);
  };

  // Save settings
  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          timezone,
          display_name: displayName.trim() || null
        })
        .eq('id', user.id)
        .select();

      if (updateError) throw updateError;
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">{t('common.signIn')}</p>
          <Link 
            href="/login"
            className="text-orange-400 hover:text-orange-300 underline"
          >
            {t('common.signIn')}
          </Link>
        </div>
      </div>
    );
  }

  // Current time example
  const currentTime = new Date().toLocaleString(language === 'es' ? 'es-ES' : 'en-US', {
    timeZone: timezone,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link 
            href="/"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-bold text-white">{t('settings.title')}</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Profile Section */}
        <section className="bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-orange-400" />
            {t('settings.profile')}
          </h2>

          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {t('settings.displayName')}
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={t('settings.displayName')}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <p className="text-xs text-slate-500 mt-1">
              {t('settings.displayNameHint')}
            </p>
          </div>
        </section>

        {/* Language Section */}
        <section className="bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Languages className="w-5 h-5 text-orange-400" />
            {t('settings.language')}
          </h2>

          {/* Language Selector */}
          <div>
            <div className="flex gap-3">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all cursor-pointer ${
                    language === lang.code
                      ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                      : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <span className="font-medium">{lang.name}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-3">
              {t('settings.languageHint')}
            </p>
          </div>
        </section>

        {/* Timezone Section */}
        <section className="bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-orange-400" />
            {t('settings.timezone')}
          </h2>

          {/* Timezone Selector */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {t('settings.yourTimezone')}
            </label>
            <div className="flex gap-2">
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
              >
                {COMMON_TIMEZONES.map(tz => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
              <button
                onClick={detectTimezone}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors cursor-pointer text-sm"
                title={t('settings.autoDetect')}
              >
                {t('settings.autoDetect')}
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-slate-800/50 rounded-lg p-4">
            <p className="text-sm text-slate-400 mb-1">{t('settings.currentTime')}</p>
            <p className="text-white font-medium">{currentTime}</p>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
            {error}
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <Link
            href="/"
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors cursor-pointer"
          >
            {t('common.cancel')}
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <>{t('common.saving')}</>
            ) : saved ? (
              <>
                <Check size={18} />
                {t('common.saved')}
              </>
            ) : (
              <>
                <Save size={18} />
                {t('settings.saveChanges')}
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
