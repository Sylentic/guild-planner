'use client';

import { use, useEffect, useState } from 'react';
import { GameLayout } from '../GameLayout';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGroupData } from '@/hooks/useGroupData';
import { useGroupMembership } from '@/hooks/useGroupMembership';
import { usePermissions } from '@/hooks/usePermissions';
import { RankManagement } from '@/components/settings/RankManagement';
import { ClanSettings } from '@/components/settings/ClanSettings';
import { getGroupBySlug } from '@/lib/auth';
import Link from 'next/link';
import { Shield } from 'lucide-react';

export default function GameSettingsPage({ params }: { params: Promise<{ group: string; game: string }> }) {
  const { group: groupSlug, game: gameSlug } = use(params);
  const { user } = useAuthContext();
  const { t } = useLanguage();

  const { group } = useGroupData(groupSlug, gameSlug);
  const {
    membership,
    members,
    canManageMembers,
    updateRank,
  } = useGroupMembership(group?.id || null, user?.id || null, gameSlug);

  const { hasPermission } = usePermissions(group?.id || undefined);
  const canEditSettings = hasPermission('settings_edit');

  if (!group || !user || !membership) {
    return <GameLayout params={params} activeTab="manage"><div /></GameLayout>;
  }

  return (
    <GameLayout params={params} activeTab="manage">
      <div className="space-y-6">
        {/* Link to Group Settings */}
        {membership.role === 'admin' && (
          <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg border border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-white mb-1">Group-Wide Settings</h3>
                <p className="text-xs text-slate-400">
                  Manage recruitment, permissions, games, member roles, and group icon
                </p>
              </div>
              <Link
                href={`/${groupSlug}/settings`}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded-lg transition-colors"
              >
                <Shield className="w-4 h-4" />
                Group Settings
              </Link>
            </div>
          </div>
        )}

        {/* Game-Specific Rank Management */}
        {canManageMembers && (
          <RankManagement
            members={members}
            onUpdateRank={updateRank}
            currentUserId={user.id}
            currentUserRole={membership.role || 'member'}
            gameSlug={gameSlug}
          />
        )}

        {/* Game-Specific Webhooks & Notifications */}
        {canEditSettings && group && (
          <ClanSettings
            groupId={group.id}
            gameSlug={gameSlug}
            currentWebhookUrl={group.group_webhook_url || ''}
            currentWelcomeWebhookUrl={group.group_welcome_webhook_url || ''}
            currentAocWebhookUrl={group.aoc_webhook_url || ''}
            currentAocEventsWebhookUrl={group.aoc_events_webhook_url || ''}
            currentScWebhookUrl={group.sc_webhook_url || ''}
            currentScEventsWebhookUrl={group.sc_events_webhook_url || ''}
            currentRorWebhookUrl={group.ror_webhook_url || ''}
            currentRorEventsWebhookUrl={group.ror_events_webhook_url || ''}
            notifyOnEvents={group.notify_on_events ?? true}
            notifyOnAnnouncements={group.notify_on_announcements ?? true}
            announcementRoleId={group.discord_announcement_role_id || ''}
            aocAnnouncementRoleId={group.aoc_announcement_role_id || ''}
            aocEventsRoleId={group.aoc_events_role_id || ''}
            scAnnouncementRoleId={group.sc_announcement_role_id || ''}
            scEventsRoleId={group.sc_events_role_id || ''}
            rorAnnouncementRoleId={group.ror_announcement_role_id || ''}
            rorEventsRoleId={group.ror_events_role_id || ''}
            aocWelcomeEnabled={group.aoc_welcome_enabled ?? true}
            scWelcomeEnabled={group.sc_welcome_enabled ?? true}
          />
        )}
      </div>
    </GameLayout>
  );
}