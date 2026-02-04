'use client';

import { useState } from 'react';
import { Handshake, Users, Plus, Crown, LogOut } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AllianceWithMembers } from '@/lib/types';
import { AllianceData } from '@/hooks/useAlliances';
import { AllianceForm } from './AllianceForm';
import { InviteGuildModal } from './InviteGuildModal';

interface AllianceViewProps {
  alliance: AllianceWithMembers | null;
  groupId: string;
  onCreateAlliance?: (data: AllianceData) => Promise<string>;
  onInviteGuild?: (allianceId: string, targetClanId: string) => Promise<void>;
  onLeave: (allianceId: string) => Promise<void>;
  isOfficer: boolean;
}

export function AllianceView({
  alliance,
  groupId,
  onCreateAlliance,
  onInviteGuild,
  onLeave,
  isOfficer,
}: AllianceViewProps) {
  const { t } = useLanguage();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const handleCreateAlliance = async (data: AllianceData, invitedClans: string[]) => {
    if (!onCreateAlliance) return;
    
    const allianceId = await onCreateAlliance(data);
    
    // Invite selected clans if any
    if (onInviteGuild && invitedClans.length > 0) {
      for (const clanId of invitedClans) {
        await onInviteGuild(allianceId, groupId);
      }
    }
  };

  const handleInviteGuild = async (targetClanId: string) => {
    if (!onInviteGuild || !alliance) return;
    await onInviteGuild(alliance.id, targetClanId);
  };

  if (!alliance) {
    return (
      <>
        <div className="bg-slate-800/50 rounded-xl p-8 text-center">
          <Handshake className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-300 mb-2">
            {t('alliance.noAlliances')}
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            {t('alliance.noAlliancesDesc')}
          </p>
          {onCreateAlliance && isOfficer && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center gap-2 px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              {t('alliance.createAlliance')}
            </button>
          )}
        </div>

        {/* Create Alliance Modal */}
        <AllianceForm
          isOpen={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleCreateAlliance}
          groupId={groupId}
        />
      </>
    );
  }

  const isLeader = alliance.leader_group_id === groupId;
  const myMembership = alliance.members.find(m => m.group_id === groupId);
  const activeMembers = alliance.members.filter(m => m.status === 'active');
  const memberGroupIds = alliance.members.map(m => m.group_id);

  return (
    <>
      <div className="space-y-4">
        {/* Alliance Header */}
        <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <Handshake className="w-8 h-8 text-purple-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{alliance.name}</h2>
                {isLeader && (
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    {t('alliance.isLeader')}
                  </span>
                )}
              </div>
              {alliance.description && (
                <p className="text-slate-400 text-sm mt-1">{alliance.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Member Guilds */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <Users className="w-4 h-4" />
              {t('alliance.memberGuilds')} ({activeMembers.length})
            </h3>
            {onInviteGuild && myMembership?.can_invite && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                {t('alliance.inviteGuild')}
              </button>
            )}
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {activeMembers.map((member) => (
              <div
                key={member.id}
                className="bg-slate-800/80 border border-slate-700 rounded-lg p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    member.group_id === alliance.leader_group_id
                      ? 'bg-amber-500/20'
                      : 'bg-slate-700'
                  }`}>
                    {member.is_founder ? (
                      <Crown className="w-5 h-5 text-amber-400" />
                    ) : (
                      <Users className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-white">
                      {member.clan?.name || 'Unknown Guild'}
                    </div>
                    <div className="flex gap-2 text-xs text-slate-500">
                      {member.can_invite && (
                        <span className="text-purple-400">{t('alliance.canInvite')}</span>
                      )}
                      {member.can_create_events && (
                        <span className="text-blue-400">{t('alliance.canCreateEvents')}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leave Alliance */}
        {!isLeader && (
          <div className="pt-4 border-t border-slate-700">
            <button
              onClick={() => onLeave(alliance.id)}
              className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm"
            >
              <LogOut className="w-4 h-4" />
              {t('alliance.leaveAlliance')}
            </button>
          </div>
        )}
      </div>

      {/* Invite Guild Modal */}
      <InviteGuildModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvite={handleInviteGuild}
        allianceId={alliance.id}
        allianceName={alliance.name}
        excludeClanIds={memberGroupIds}
      />
    </>
  );
}


