'use client';

import { use, useEffect, useState } from 'react';
import { GameLayout } from '../GameLayout';
import { useAuthContext } from '@/components/AuthProvider';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGroupData } from '@/hooks/useGroupData';
import { useGroupMembership } from '@/hooks/useGroupMembership';
import { ManageTab } from '../tabs/ManageTab';
import { GuildIconUploaderWrapper } from '../GuildIconUploaderWrapper';
import { PermissionsSettings } from '@/components/PermissionsSettings';
import { ClanSettings } from '@/components/ClanSettings';
import { RecruitmentSettings } from '@/components/RecruitmentSettings';
import { getGroupBySlug } from '@/lib/auth';

export default function SettingsPage({ params }: { params: Promise<{ group: string; game: string }> }) {
  const { group: groupSlug, game: gameSlug } = use(params);
  const { user } = useAuthContext();
  const { t } = useLanguage();

  const { group } = useGroupData(groupSlug, gameSlug);
  const {
    membership,
    members,
    pendingMembers,
    canManageMembers,
    canManageRoles,
    acceptMember,
    rejectMember,
    updateRole,
    updateRank,
    removeMember,
  } = useGroupMembership(group?.id || null, user?.id || null, gameSlug);

  const [guildIconUrl, setGuildIconUrl] = useState(group?.group_icon_url || '');

  useEffect(() => {
    setGuildIconUrl(group?.group_icon_url || '');
  }, [group?.group_icon_url]);

  async function refreshGuildIcon() {
    if (!groupSlug) return;
    const latest = await getGroupBySlug(groupSlug);
    if (latest?.group_icon_url) setGuildIconUrl(latest.group_icon_url);
  }

  if (!group || !user || !membership) {
    return <GameLayout params={params} activeTab="manage"><div /></GameLayout>;
  }

  return (
    <GameLayout params={params} activeTab="manage">
      <div className="space-y-6">
        {membership.role === 'admin' && group && (
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
          currentUserId={user.id}
          currentUserRole={membership.role || 'member'}
          gameSlug={gameSlug}
          t={t}
        />

        {membership.role === 'admin' && group && (
          <PermissionsSettings groupId={group.id} userRole={membership.role || 'member'} />
        )}

        {membership.role === 'admin' && group && (
          <ClanSettings
            groupId={group.id}
            gameSlug={gameSlug}
            currentWebhookUrl={group.group_webhook_url || ''}
            currentWelcomeWebhookUrl={group.group_welcome_webhook_url || ''}
            notifyOnEvents={group.notify_on_events ?? true}
            notifyOnAnnouncements={group.notify_on_announcements ?? true}
            announcementRoleId={group.discord_announcement_role_id || ''}
            scAnnouncementRoleId={group.sc_announcement_role_id || ''}
            scEventsRoleId={group.sc_events_role_id || ''}
            aocWelcomeEnabled={group.aoc_welcome_enabled ?? true}
            scWelcomeEnabled={group.sc_welcome_enabled ?? true}
          />
        )}

        {membership.role === 'admin' && group && (
          <RecruitmentSettings groupId={group.id} groupSlug={groupSlug} />
        )}
      </div>
    </GameLayout>
  );
}