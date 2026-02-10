'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGameLayoutContext } from '@/contexts/GameLayoutContext';
import { useGroupMembership } from '@/hooks/useGroupMembership';
import { ManageTab } from '../tabs/ManageTab';
import { GuildIconUploaderWrapper } from '../GuildIconUploaderWrapper';
import { PermissionsSettings } from '@/components/settings/PermissionsSettings';
import { ClanSettings } from '@/components/settings/ClanSettings';
import { getGroupBySlug } from '@/lib/auth';
import Link from 'next/link';
import { Shield } from 'lucide-react';

export default function SettingsPage() {
  const { group, groupSlug, gameSlug, userId, hasPermission, membership } = useGameLayoutContext();
  const { t } = useLanguage();

  // Settings page needs full membership management functions
  const {
    members,
    canManageMembers,
    updateRank,
    removeMember,
  } = useGroupMembership(group?.id || null, userId, gameSlug);

  const canViewPermissions = hasPermission('settings_view_permissions');
  const canEditPermissions = hasPermission('settings_edit_permissions');
  const canEditSettings = hasPermission('settings_edit');

  const [guildIconUrl, setGuildIconUrl] = useState(group?.group_icon_url || '');

  useEffect(() => {
    setGuildIconUrl(group?.group_icon_url || '');
  }, [group?.group_icon_url]);

  async function refreshGuildIcon() {
    if (!groupSlug) return;
    const latest = await getGroupBySlug(groupSlug);
    if (latest?.group_icon_url) setGuildIconUrl(latest.group_icon_url);
  }

  if (!group || !userId || !membership) {
    return null;
  }

  return (
    <div className="space-y-6">
      {canEditSettings && group && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Group Icon</h3>
          <GuildIconUploaderWrapper
            groupId={group.id}
            currentUrl={guildIconUrl}
            onIconChange={refreshGuildIcon}
          />
        </div>
      )}

      <ManageTab
        members={members}
        pendingMembers={pendingMembers}
        onAccept={acceptMember}
        onReject={rejectMember}
        onUpdateRole={canManageRoles ? updateRole : undefined}
        onUpdateRank={canManageMembers ? updateRank : undefined}
        onRemove={canManageRoles ? removeMember : undefined}
        currentUserId={userId}
        currentUserRole={membership.role || 'member'}
        gameSlug={gameSlug}
        t={t}
      />

      {canEditPermissions && group && (
        <PermissionsSettings groupId={group.id} userRole={membership.role || 'member'} />
      )}

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

      {membership.role === 'admin' && group && (
        <RecruitmentSettings groupId={group.id} groupSlug={groupSlug} />
      )}

      {membership.role === 'admin' && group && (
        <GameManagement groupId={group.id} />
      )}
    </div>
  );
}