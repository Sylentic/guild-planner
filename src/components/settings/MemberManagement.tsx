'use client';

import { Clock, Users, Trash2, Shield } from 'lucide-react';
import { ROLE_CONFIG, GroupRole, getRoleHierarchy } from '@/lib/permissions';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { useProcessingSet } from '@/hooks/useProcessingSet';

interface MemberManagementProps {
  members: Array<{
    id: string;
    user_id: string;
    role: string | null;
    is_creator: boolean;
    user: { display_name: string | null; discord_username: string | null; discord_avatar: string | null } | null;
  }>;
  pendingMembers: Array<{
    id: string;
    user_id: string;
    role: string | null;
    is_creator: boolean;
    user: { display_name: string | null; discord_username: string | null; discord_avatar: string | null } | null;
  }>;
  onAccept: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  onUpdateRole?: (id: string, role: GroupRole) => Promise<void>;
  onRemove?: (id: string) => Promise<void>;
  currentUserId: string;
  currentUserRole: GroupRole;
  currentUserIsCreator: boolean;
}

export function MemberManagement({
  members,
  pendingMembers,
  onAccept,
  onReject,
  onUpdateRole,
  onRemove,
  currentUserId,
  currentUserRole,
  currentUserIsCreator,
}: MemberManagementProps) {
  const { processing, add, remove } = useProcessingSet();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [memberIdToRemove, setMemberIdToRemove] = useState<string | null>(null);
  const { t } = useLanguage();

  const handleAccept = async (memberId: string) => {
    add(memberId);
    try {
      await onAccept(memberId);
    } finally {
      remove(memberId);
    }
  };

  const handleReject = async (memberId: string) => {
    add(memberId);
    try {
      await onReject(memberId);
    } finally {
      remove(memberId);
    }
  };

  const handleRoleUpdate = async (memberId: string, newRole: GroupRole) => {
    if (!onUpdateRole) return;
    add(memberId);
    try {
      await onUpdateRole(memberId, newRole);
    } finally {
      remove(memberId);
    }
  };

  const handleRemove = (memberId: string) => {
    setMemberIdToRemove(memberId);
    setDeleteConfirmOpen(true);
  };

  const confirmRemove = async () => {
    if (!memberIdToRemove || !onRemove) return;
    
    setDeleteConfirmOpen(false);
    add(memberIdToRemove);
    try {
      await onRemove(memberIdToRemove);
    } finally {
      remove(memberIdToRemove);
      setMemberIdToRemove(null);
    }
  };

  const canEditMemberRole = (memberId: string, memberRole: string | null): boolean => {
    if (memberId === currentUserId) return false;

    if (currentUserIsCreator) return true;
    
    const hierarchy = getRoleHierarchy();
    const currentHierarchy = hierarchy[currentUserRole];
    const targetHierarchy = hierarchy[memberRole as GroupRole] || 0;
    
    return currentHierarchy > targetHierarchy;
  };

  const getAvailableRoles = (memberId: string): GroupRole[] => {
    if (!canEditMemberRole(memberId, members.find(m => m.id === memberId)?.role || null)) {
      return [];
    }

    if (currentUserIsCreator) {
      return Object.keys(ROLE_CONFIG)
        .filter((role) => role !== 'pending')
        .map((role) => role as GroupRole);
    }
    
    const hierarchy = getRoleHierarchy();
    const currentHierarchy = hierarchy[currentUserRole];
    return Object.entries(ROLE_CONFIG)
      .filter(([role]) => hierarchy[role as GroupRole] < currentHierarchy)
      .map(([role]) => role as GroupRole);
  };

  const getRoleRank = (role: string | null): number => {
    const hierarchy = getRoleHierarchy();
    return role && Object.prototype.hasOwnProperty.call(hierarchy, role)
      ? hierarchy[role as GroupRole]
      : 0;
  };

  const getMemberRank = (member: { role: string | null; is_creator: boolean }) =>
    member.is_creator ? 6 : getRoleRank(member.role);

  const getMemberRoleConfig = (member: { role: string | null; is_creator: boolean }) => {
    if (member.is_creator) return ROLE_CONFIG.admin;
    const validRole = (role: string | null): role is GroupRole =>
      role !== null && Object.prototype.hasOwnProperty.call(ROLE_CONFIG, role);
    const roleKey: GroupRole = validRole(member.role) ? member.role : 'member';
    return ROLE_CONFIG[roleKey];
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg border border-slate-700 p-6">
      <div className="space-y-6">
        {/* Pending Applications */}
        {pendingMembers.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="text-yellow-400" size={20} />
              Pending Applications ({pendingMembers.length})
            </h3>
            <div className="space-y-2">
              {pendingMembers.map((member) => (
                <div
                  key={member.id}
                  className="bg-slate-800/60 border border-yellow-500/30 rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    {member.user?.discord_avatar ? (
                      <img
                        src={member.user.discord_avatar}
                        alt=""
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-slate-400" />
                      </div>
                    )}
                    <span className="text-white font-medium">
                      {member.user?.display_name || member.user?.discord_username || 'Unknown User'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAccept(member.id)}
                      disabled={processing.has(member.id)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      {processing.has(member.id) ? 'Processing...' : 'Accept'}
                    </button>
                    <button
                      onClick={() => handleReject(member.id)}
                      disabled={processing.has(member.id)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-700 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      {processing.has(member.id) ? 'Processing...' : 'Reject'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current Members */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="text-blue-400" size={20} />
            Members ({members.length})
          </h3>
          <div className="space-y-2">
            {members
              .slice()
              .sort((a, b) => {
                const roleDiff = getMemberRank(b) - getMemberRank(a);
                if (roleDiff !== 0) return roleDiff;
                const nameA = (a.user?.display_name || a.user?.discord_username || '').toLowerCase();
                const nameB = (b.user?.display_name || b.user?.discord_username || '').toLowerCase();
                return nameA.localeCompare(nameB);
              })
              .map((member) => {
                const availableRoles = getAvailableRoles(member.id);
                const canEdit = availableRoles.length > 0;
                const isCurrentUser = member.user_id === currentUserId;
                const roleConfig = getMemberRoleConfig(member);
                const roleLabel = member.is_creator ? 'Creator' : roleConfig.label;

              return (
                <div
                  key={member.id}
                  className={`bg-slate-800/60 border ${roleConfig.borderColor} rounded-lg p-4`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className={roleConfig.color}>{String.fromCharCode(9679)}</span>
                      {member.user?.discord_avatar ? (
                        <img
                          src={member.user.discord_avatar}
                          alt=""
                          className="w-10 h-10 rounded-full flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                          <Shield className="w-5 h-5 text-slate-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium truncate">
                          {member.user?.display_name || member.user?.discord_username || 'Unknown User'}
                          {isCurrentUser && <span className="text-slate-400 ml-2">(You)</span>}
                          <span className={`ml-2 text-sm ${roleConfig.color}`}>{roleLabel}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Role Selector */}
                      {onUpdateRole && (
                        <select
                          value={member.role || 'member'}
                          onChange={(e) => handleRoleUpdate(member.id, e.target.value as GroupRole)}
                          disabled={!canEdit || processing.has(member.id)}
                          className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value={member.role || 'member'}>
                            {ROLE_CONFIG[member.role as GroupRole]?.label || 'Member'}
                          </option>
                          {canEdit && availableRoles.map((role) => (
                            role !== member.role && (
                              <option key={role} value={role}>
                                {ROLE_CONFIG[role].label}
                              </option>
                            )
                          ))}
                        </select>
                      )}

                      {/* Remove Button */}
                      {onRemove && canEdit && !member.is_creator && (
                        <button
                          onClick={() => handleRemove(member.id)}
                          disabled={processing.has(member.id)}
                          className="p-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/50 rounded-lg transition-colors disabled:opacity-50"
                          title="Remove member"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setMemberIdToRemove(null);
        }}
        onConfirm={confirmRemove}
        title="Remove Member"
        message="Are you sure you want to remove this member? This action cannot be undone."
        confirmLabel="Remove"
        variant="danger"
      />
    </div>
  );
}
