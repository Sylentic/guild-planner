'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Settings } from 'lucide-react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGroupData } from '@/hooks/useGroupData';
import { useGroupMembership } from '@/hooks/useGroupMembership';
import { usePermissions } from '@/hooks/usePermissions';
import { GuildIconUploaderWrapper } from '../[game]/GuildIconUploaderWrapper';
import { PermissionsSettings } from '@/components/settings/PermissionsSettings';
import { RecruitmentSettings } from '@/components/settings/RecruitmentSettings';
import { GameManagement } from '@/components/settings/GameManagement';
import { MemberManagement } from '@/components/settings/MemberManagement';
import { getGroupBySlug } from '@/lib/auth';
import { ClanLoadingScreen } from '@/components/screens/ClanLoadingScreen';

export default function GroupSettingsPage({ params }: { params: Promise<{ group: string }> }) {
  const { group: groupSlug } = use(params);
  const { user, profile } = useAuthContext();
  const { t } = useLanguage();

  const { group } = useGroupData(groupSlug);
  const {
    membership,
    members,
    pendingMembers,
    acceptMember,
    rejectMember,
    updateRole,
    removeMember,
    loading: membershipLoading
  } = useGroupMembership(group?.id || null, user?.id || null);

  const { hasPermission } = usePermissions(group?.id || undefined);
  const canViewPermissions = hasPermission('settings_view_permissions');
  const canEditPermissions = hasPermission('settings_edit_roles');
  const canEditSettings = hasPermission('settings_edit');

  const [guildIconUrl, setGuildIconUrl] = useState<string>('');
  const iconUrl = group?.group_icon_url || guildIconUrl;

  async function refreshGuildIcon() {
    if (!groupSlug) return;
    const latest = await getGroupBySlug(groupSlug);
    if (latest?.group_icon_url) setGuildIconUrl(latest.group_icon_url);
  }

  if (membershipLoading) {
    return <ClanLoadingScreen />;
  }

  if (!group || !user || !membership) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-center">
          <p>Loading group settings...</p>
        </div>
      </div>
    );
  }

  // Only admins can access group settings
  if (membership.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-slate-400 mb-6">You need admin access to view group settings.</p>
          <Link
            href={`/${groupSlug}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Group
          </Link>
        </div>
      </div>
    );
  }

  const displayName = profile?.display_name || profile?.discord_username || 'User';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href={`/${groupSlug}`}
                className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-400" />
              </Link>
              {group.group_icon_url && (
                <img
                  src={group.group_icon_url}
                  alt={group.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              )}
              <div>
                <h1 className="text-xl font-bold text-white">{group.name}</h1>
                <p className="text-sm text-slate-400">Group Settings</p>
              </div>
            </div>
            <div className="text-sm text-slate-400">
              {displayName}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Group Icon */}
          {canEditSettings && (
            <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Settings size={20} className="text-orange-400" />
                Group Icon
              </h3>
              <GuildIconUploaderWrapper
                groupId={group.id}
                currentUrl={guildIconUrl}
                onIconChange={refreshGuildIcon}
              />
            </div>
          )}

          {/* Member Management */}
          <MemberManagement
            members={members}
            pendingMembers={pendingMembers}
            onAccept={acceptMember}
            onReject={rejectMember}
            onUpdateRole={updateRole}
            onRemove={removeMember}
            currentUserId={user.id}
            currentUserRole={membership.role || 'member'}
            currentUserIsCreator={membership.isCreator}
          />

          {/* Permissions Settings */}
          {canEditPermissions && (
            <PermissionsSettings groupId={group.id} userRole={membership.role || 'member'} />
          )}

          {/* Recruitment Settings */}
          <RecruitmentSettings groupId={group.id} groupSlug={groupSlug} />

          {/* Game Management */}
          <GameManagement groupId={group.id} />
        </div>
      </main>
    </div>
  );
}
