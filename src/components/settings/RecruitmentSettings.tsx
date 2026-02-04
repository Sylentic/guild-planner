"use client";
import { usePermissions } from '@/hooks/usePermissions';
import { Skeleton } from '@/components/ui/Skeleton';

import { useState, useEffect } from 'react';
import { Globe, UserPlus, Save, Loader2, Check, ExternalLink, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { RecruitmentApplication } from '@/lib/types';

interface RecruitmentSettingsProps {
  groupId: string;
  groupSlug: string;
}

export function RecruitmentSettings({ groupId, groupSlug }: RecruitmentSettingsProps) {
  const { loading } = usePermissions(groupId);
  const [isPublic, setIsPublic] = useState(false);
  const [recruitmentOpen, setRecruitmentOpen] = useState(false);
  const [recruitmentMessage, setRecruitmentMessage] = useState('');
  const [publicDescription, setPublicDescription] = useState('');
  const [applications, setApplications] = useState<RecruitmentApplication[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [localLoading, setLocalLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch current settings and applications
  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      if (!isMounted) return;
      setError(null);
      try {
        console.log('[RecruitmentSettings] Fetching clan settings for:', groupId);
        // Fetch clan settings
        const { data: clanData, error: clanError } = await supabase
          .from('groups')
          .select('is_public, recruitment_open, recruitment_message, public_description')
          .eq('id', groupId)
          .single();
        if (!isMounted) return;
        if (clanError) {
          console.error('[RecruitmentSettings] Error fetching clan:', clanError);
        }

        if (clanData) {
          console.log('[RecruitmentSettings] Clan data:', clanData);
          setIsPublic(clanData.is_public || false);
          setRecruitmentOpen(clanData.recruitment_open || false);
          setRecruitmentMessage(clanData.recruitment_message || '');
          setPublicDescription(clanData.public_description || '');
        }

        // Fetch applications
        console.log('[RecruitmentSettings] Fetching applications...');
        const { data: appsData, error: appsError } = await supabase
          .from('recruitment_applications')
          .select('*')
          .eq('group_id', groupId)
          .order('created_at', { ascending: false });

        if (!isMounted) return;

        if (appsError) {
          console.error('[RecruitmentSettings] Error fetching applications:', appsError);
        }

        if (appsData) {
          console.log('[RecruitmentSettings] Applications:', appsData.length);
          setApplications(appsData);
        }
      } catch (err) {
        console.error('[RecruitmentSettings] Unexpected error:', err);
        if (isMounted) {
          setError('Failed to load settings');
        }
      } finally {
        if (isMounted) {
          setLocalLoading(false);
        }
      }
    }

    if (groupId) {
      fetchData();
    } else {
      setLocalLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [groupId]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    console.log('[RecruitmentSettings] Saving settings...');
    
    try {
      const updateData = {
        is_public: isPublic,
        recruitment_open: recruitmentOpen,
        recruitment_message: recruitmentMessage.trim() || null,
        public_description: publicDescription.trim() || null,
      };
      console.log('[RecruitmentSettings] Update data:', updateData);

      const { error: updateError } = await supabase
        .from('groups')
        .update(updateData)
        .eq('id', groupId)
        .select();

      if (updateError) {
        console.error('[RecruitmentSettings] Save error:', updateError);
        setError(updateError.message);
        return;
      }
      
      console.log('[RecruitmentSettings] Save successful');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('[RecruitmentSettings] Unexpected save error:', err);
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleApplicationAction = async (appId: string, action: 'accepted' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('recruitment_applications')
        .update({
          status: action,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', appId)
        .select();

      if (error) throw error;

      setApplications(prev => 
        prev.map(app => 
          app.id === appId ? { ...app, status: action } : app
        )
      );
    } catch (error) {
      console.error('Error updating application:', error);
    }
  };

  const pendingApps = applications.filter(a => a.status === 'pending');

  if (loading) {
    return (
      <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg border border-slate-700 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="animate-spin text-orange-400" size={24} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Recruitment Settings */}
      <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg border border-slate-700 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <UserPlus size={20} className="text-orange-400" />
            Recruitment Settings
          </h3>
          {isPublic && (
            <a
              href={`/${groupSlug}/public`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-orange-400 hover:text-orange-300"
            >
              View Public Page
              <ExternalLink size={14} />
            </a>
          )}
        </div>

        {/* Toggles */}
        <div className="space-y-4">
          {/* Public Profile */}
          <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
            <div>
              <div className="flex items-center gap-2 text-white font-medium">
                <Globe size={16} />
                Public Profile
              </div>
              <p className="text-sm text-slate-400 mt-0.5">
                Allow anyone to view your guild&apos;s public page
              </p>
            </div>
            {/* axe-ignore aria-valid-attr-value */}
            <button
              onClick={() => setIsPublic(!isPublic)}
              className={`flex items-center shrink-0 w-12 h-7 rounded-full cursor-pointer transition-colors p-1 ${
                isPublic 
                  ? 'bg-orange-500 justify-end' 
                  : 'bg-slate-600 justify-start'
              }`}
              role="switch"
              aria-checked={isPublic}
              aria-label="Toggle public visibility"
              title="Toggle public visibility"
            >
              <span className="block w-5 h-5 bg-white rounded-full shadow-md" />
            </button>
          </div>

          {/* Open Recruitment */}
          <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
            <div>
              <div className="flex items-center gap-2 text-white font-medium">
                <UserPlus size={16} />
                Open Recruitment
              </div>
              <p className="text-sm text-slate-400 mt-0.5">
                Allow players to submit applications
              </p>
            </div>
            {/* axe-ignore aria-valid-attr-value */}
            <button
              onClick={() => setRecruitmentOpen(!recruitmentOpen)}
              className={`flex items-center shrink-0 w-12 h-7 rounded-full cursor-pointer transition-colors p-1 ${
                recruitmentOpen 
                  ? 'bg-green-500 justify-end' 
                  : 'bg-slate-600 justify-start'
              }`}
              role="switch"
              aria-checked={recruitmentOpen}
              aria-label="Toggle recruitment status"
              title="Toggle recruitment status"
            >
              <span className="block w-5 h-5 bg-white rounded-full shadow-md" />
            </button>
          </div>
        </div>

        {/* Public Description */}
        <div>
          <label htmlFor="recruitment-public-description" className="block text-sm font-medium text-slate-300 mb-1">
            Public Description
          </label>
          <textarea
            id="recruitment-public-description"
            value={publicDescription}
            onChange={(e) => setPublicDescription(e.target.value)}
            placeholder="Tell potential recruits about your guild..."
            rows={3}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
          />
        </div>

        {/* Recruitment Message */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Recruitment Message
          </label>
          <input
            type="text"
            value={recruitmentMessage}
            onChange={(e) => setRecruitmentMessage(e.target.value)}
            placeholder="e.g., Looking for active raiders for launch!"
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Error display */}
        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          {loading ? (
            <Skeleton className="h-10 w-32" />
          ) : (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : saved ? (
                <Check size={16} />
              ) : (
                <Save size={16} />
              )}
              {saved ? 'Saved!' : 'Save Settings'}
            </button>
          )}
        </div>
      </div>

      {/* Applications */}
      {pendingApps.length > 0 && (
        <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg border border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Pending Applications ({pendingApps.length})
          </h3>
          <div className="space-y-3">
            {pendingApps.map(app => (
              <div 
                key={app.id}
                className="p-4 bg-slate-800/50 rounded-lg"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-white">{app.discord_username}</div>
                    {app.character_name && (
                      <div className="text-sm text-slate-400">Character: {app.character_name}</div>
                    )}
                    {app.primary_class && (
                      <div className="text-sm text-slate-400">Class: {app.primary_class}</div>
                    )}
                    {app.message && (
                      <p className="text-sm text-slate-300 mt-2">{app.message}</p>
                    )}
                    <div className="text-xs text-slate-500 mt-2">
                      Applied {new Date(app.created_at).toLocaleDateString('en-GB', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone })}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApplicationAction(app.id, 'accepted')}
                      className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors cursor-pointer"
                      title="Accept"                      aria-label="Accept"                    >
                      <CheckCircle size={20} />
                    </button>
                    <button
                      onClick={() => handleApplicationAction(app.id, 'rejected')}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors cursor-pointer"
                      title="Reject"                      aria-label="Reject"                    >
                      <XCircle size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

