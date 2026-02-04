'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ClanAchievementWithDefinition } from '@/lib/types';
import { supabase } from '@/lib/supabase';

interface AchievementAdminPanelProps {
  achievements: ClanAchievementWithDefinition[];
  groupId: string;
  onRefresh: () => Promise<void>;
}

export function AchievementAdminPanel({
  achievements,
  groupId,
  onRefresh,
}: AchievementAdminPanelProps) {
  const { t } = useLanguage();
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch('/api/group/achievements/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ clanId: groupId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to sync achievements');
      }

      const result = await response.json();
      console.log('Achievements synced:', result);
      await onRefresh();
    } catch (err) {
      console.error('Error syncing achievements:', err);
      alert('Error syncing achievements: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Achievement Sync</h3>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 disabled:opacity-50 transition-colors text-sm font-medium"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Sync Achievements'}
        </button>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className="flex items-center justify-between p-3 bg-slate-700/50 rounded border border-slate-600 hover:border-slate-500 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-lg">{achievement.definition.icon}</span>
                <span className="font-medium text-white truncate">
                  {achievement.definition.name}
                </span>
                {achievement.is_unlocked && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-500/20 text-green-300">
                    Unlocked
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {achievement.current_value} / {achievement.definition.requirement_value}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {achievement.definition.requirement_type}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded text-sm text-blue-300 space-y-2">
        <p className="font-medium">Auto-calculated from guild data:</p>
        <ul className="text-xs space-y-1 list-disc list-inside">
          <li>Member counts from clan roster</li>
          <li>Siege wins from battle records</li>
          <li>Bank deposits and caravan runs</li>
          <li>Grandmaster crafter counts</li>
          <li>Events hosted and weekly activity</li>
        </ul>
      </div>
    </div>
  );
}

