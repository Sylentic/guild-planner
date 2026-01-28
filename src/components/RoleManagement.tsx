'use client';

import { useState } from 'react';
import { ChevronDown, Shield } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useClanMembership } from '@/hooks/useClanMembership';
import { ClanRole, ROLE_CONFIG, getRoleHierarchy } from '@/lib/permissions';

export interface ClanMember {
  id: string;
  user_id: string;
  role: ClanRole;
  user?: {
    display_name: string;
    discord_username?: string;
  };
}

interface RoleManagementProps {
  clanId: string;
  members: ClanMember[];
  userRole: ClanRole;
  onRoleChange?: (userId: string, newRole: ClanRole) => Promise<void>;
}

export function RoleManagement({ clanId, members, userRole, onRoleChange }: RoleManagementProps) {
  const { t } = useLanguage();
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [message, setMessage] = useState<{ userId: string; type: 'success' | 'error'; text: string } | null>(null);
  const { updateRole } = useClanMembership(clanId, null);

  const hierarchy = getRoleHierarchy();
  const canManage = userRole === 'admin' || userRole === 'officer';

  // Get available roles to promote/demote to
  const getAvailableRoles = (): ClanRole[] => {
    // Allow assigning any role except 'pending'.
    // Use the order from ROLE_CONFIG for display.
    return (Object.keys(ROLE_CONFIG) as ClanRole[])
      .filter(role => role !== 'pending');
  };

  const handleRoleChange = async (memberId: string, userId: string, newRole: ClanRole) => {
    if (!canManage) return;

    setIsUpdating(userId);
    setMessage(null);

    try {
      // Use the updateRole hook from useClanMembership
      await updateRole(memberId, newRole);
      setMessage({ userId, type: 'success', text: `Role updated to ${ROLE_CONFIG[newRole].label}` });
      setExpandedUserId(null);
      
      // Call optional callback if provided
      if (onRoleChange) {
        await onRoleChange(userId, newRole);
      }
    } catch (error) {
      setMessage({
        userId,
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to update role'
      });
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-lg font-semibold text-white">Manage Member Roles</h3>
        <p className="text-sm text-slate-400 mt-1">
          {canManage 
            ? 'Promote or demote members within your authority level' 
            : 'You do not have permission to manage member roles'}
        </p>
      </div>

      <div className="space-y-2">
        {members.map((member) => {
          const roleConfig = ROLE_CONFIG[member.role];
          const availableRoles = getAvailableRoles();
          const isExpanded = expandedUserId === member.user_id;
          const isUpdatingMember = isUpdating === member.user_id;
          const memberMessage = message?.userId === member.user_id ? message : null;

          return (
            <div key={member.id} className="bg-slate-800/50 rounded-lg overflow-hidden">
              {/* Member Row */}
              <button
                onClick={() => canManage ? setExpandedUserId(isExpanded ? null : member.user_id) : null}
                disabled={!canManage}
                className={`w-full px-4 py-3 flex items-center justify-between hover:bg-slate-700/50 transition-colors ${!canManage ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Shield size={16} className={roleConfig.color} />
                  <div className="flex-1 min-w-0 text-left">
                    <div className="font-medium text-white truncate">
                      {member.user?.display_name || member.user?.discord_username || 'Unknown'}
                    </div>
                    <div className="text-xs text-slate-400">
                      @{member.user?.discord_username || 'unknown'}
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${roleConfig.color} bg-slate-700/50`}>
                    {roleConfig.label}
                  </div>
                </div>
                {canManage && availableRoles.length > 0 && (
                  <ChevronDown 
                    size={16} 
                    className={`ml-2 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  />
                )}
              </button>

              {/* Message */}
              {memberMessage && (
                <div className={`px-4 py-2 text-xs border-t border-slate-700 ${
                  memberMessage.type === 'success'
                    ? 'bg-green-500/10 text-green-400'
                    : 'bg-red-500/10 text-red-400'
                }`}>
                  {memberMessage.text}
                </div>
              )}

              {/* Role Selection Dropdown */}
              {isExpanded && canManage && availableRoles.length > 0 && (
                <div className="px-4 py-3 bg-slate-700/30 border-t border-slate-700 space-y-2">
                  <p className="text-xs text-slate-400">Change role to:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {availableRoles.map((role) => {
                      const config = ROLE_CONFIG[role];
                      return (
                        <button
                          key={role}
                          onClick={() => handleRoleChange(member.id, member.user_id, role)}
                          disabled={isUpdatingMember || member.role === role}
                          className={`px-2 py-1.5 rounded text-xs font-medium transition-all ${
                            member.role === role
                              ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                              : `${config.color} bg-slate-700 hover:bg-slate-600 cursor-pointer`
                          } ${isUpdatingMember ? 'opacity-50' : ''}`}
                        >
                          {isUpdatingMember ? 'Updating...' : config.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {isExpanded && canManage && availableRoles.length === 0 && (
                <div className="px-4 py-3 bg-slate-700/30 border-t border-slate-700 text-xs text-slate-400">
                  No roles available to change to
                </div>
              )}
            </div>
          );
        })}

        {members.length === 0 && (
          <div className="bg-slate-800/50 rounded-lg p-8 text-center text-slate-400">
            No members to manage
          </div>
        )}
      </div>
    </div>
  );
}
