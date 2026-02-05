import { Clock, Users } from 'lucide-react';
import { ROLE_CONFIG, GroupRole } from '@/lib/permissions';
import { getGameConfig } from '@/config';

interface ManageTabProps {
  members: Array<{
    id: string;
    user_id: string;
    role: string | null;
    guild_rank: string | null;
    is_creator: boolean;
    user: { display_name: string | null; discord_username: string | null; discord_avatar: string | null } | null;
  }>;
  pendingMembers: Array<{
    id: string;
    user_id: string;
    role: string | null;
    guild_rank: string | null;
    is_creator: boolean;
    user: { display_name: string | null; discord_username: string | null; discord_avatar: string | null } | null;
  }>;
  onAccept: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  onUpdateRole?: (id: string, role: GroupRole) => Promise<void>;
  onUpdateRank?: (id: string, rank: string | null) => Promise<void>;
  onRemove?: (id: string) => Promise<void>;
  currentUserId: string;
  currentUserRole: GroupRole;
  gameSlug?: string;
  t: (key: string) => string;
}

export function ManageTab({
  members,
  pendingMembers,
  onAccept,
  onReject,
  onUpdateRole,
  onUpdateRank,
  onRemove,
  currentUserId,
  currentUserRole,
  gameSlug = 'aoc',
  t,
}: ManageTabProps) {
  const gameConfig = getGameConfig(gameSlug);
  const gameRanks = (gameConfig as any)?.ranks || [];
  
  // Helper to get rank hierarchy level
  const getRankHierarchy = (rankId: string | null): number => {
    if (!rankId) return 0;
    const rank = gameRanks.find((r: any) => r.id === rankId);
    return rank?.hierarchy || 0;
  };

  // Helper to check if current user can edit member's rank
  const canEditMemberRank = (memberId: string, memberRole: string | null): boolean => {
    // Can't edit your own rank
    if (memberId === currentUserId) return false;
    
    // Admins can edit any rank
    if (currentUserRole === 'admin') return true;
    
    // Officers can edit ranks of members and trials
    if (currentUserRole === 'officer') {
      return memberRole === 'member' || memberRole === 'trial';
    }
    
    // Members and trials cannot edit ranks
    return false;
  };

  // Helper to get current user's rank hierarchy
  const getCurrentUserRankHierarchy = (): number => {
    const currentUserMember = members.find(m => m.user_id === currentUserId);
    return getRankHierarchy(currentUserMember?.guild_rank || null);
  };

  return (
    <div className="space-y-6">
      {/* Pending Applications */}
      {pendingMembers.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="text-yellow-400" size={20} />
            {t('members.pendingApplications')} ({pendingMembers.length})
          </h2>
          <div className="space-y-2">
            {pendingMembers.map((member) => (
              <div
                key={member.id}
                className="bg-slate-900/80 border border-yellow-500/30 rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {member.user?.discord_avatar ? (
                    <img
                      src={member.user.discord_avatar}
                      alt=""
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-slate-700 rounded-full" />
                  )}
                  <span className="text-white">
                    {member.user?.display_name || member.user?.discord_username || 'Unknown'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onAccept(member.id)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm cursor-pointer"
                  >
                    {t('members.accept')}
                  </button>
                  <button
                    onClick={() => onReject(member.id)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm cursor-pointer"
                  >
                    {t('members.reject')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Members */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Users className="text-cyan-400" size={20} />
          {t('members.title')} ({members.length})
        </h2>
        <div className="space-y-2">
          {(() => {
            // Sort members by creator status, role hierarchy, then display name
            const getRoleRank = (role: string | null) => {
              const hierarchy = {
                admin: 4,
                officer: 3,
                member: 2,
                trial: 1,
                pending: 0,
              };
              return role && Object.prototype.hasOwnProperty.call(hierarchy, role)
                ? hierarchy[role as keyof typeof hierarchy]
                : -1;
            };

            const getMemberRank = (member: { role: string | null; is_creator: boolean }) =>
              member.is_creator ? 5 : getRoleRank(member.role);

            const getMemberRoleConfig = (member: { role: string | null; is_creator: boolean }) => {
              if (member.is_creator) return ROLE_CONFIG.admin;
              const validRole = (role: string | null): role is GroupRole =>
                role !== null && Object.prototype.hasOwnProperty.call(ROLE_CONFIG, role);
              const roleKey: GroupRole = validRole(member.role) ? member.role : 'member';
              return ROLE_CONFIG[roleKey];
            };

            return members
              .slice()
              .sort((a, b) => {
                const roleDiff = getMemberRank(b) - getMemberRank(a);
                if (roleDiff !== 0) return roleDiff;
                const nameA = (a.user?.display_name || a.user?.discord_username || '').toLowerCase();
                const nameB = (b.user?.display_name || b.user?.discord_username || '').toLowerCase();
                return nameA.localeCompare(nameB);
              })
              .map((member) => {
                const roleConfig = getMemberRoleConfig(member);
                return (
                  <div
                    key={member.id}
                    className={[
                      "bg-slate-900/80",
                      "backdrop-blur-sm",
                      "rounded-lg",
                      "border",
                      roleConfig.borderColor,
                      "transition-all",
                      "duration-300",
                      "hover:border-slate-600",
                      "p-4",
                      "flex",
                      "items-center",
                      "justify-between"
                    ].join(' ')}
                  >
                    <div className="flex items-center gap-3">
                      {/* Colored dot for role */}
                      <span className={roleConfig.color}>{String.fromCharCode(9679)}</span>
                    {member.user?.discord_avatar ? (
                      <img
                        src={member.user.discord_avatar}
                        alt=""
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-slate-700 rounded-full" />
                    )}
                    <div>
                      <span className="text-white">
                        {member.user?.display_name || member.user?.discord_username || 'Unknown'}
                      </span>
                      <span className={`ml-2 text-sm ${roleConfig.color}`}>
                        {member.role}{member.is_creator && ' (creator)'}
                      </span>
                    </div>
                  </div>
                  {onUpdateRole && member.user_id !== currentUserId && (
                    <div className="flex items-center gap-2">
                      <select
                        value={member.role || 'member'}
                        onChange={(e) => onUpdateRole(member.id, e.target.value as GroupRole)}
                        className="bg-slate-800 border border-slate-600 rounded px-3 py-1 text-white text-sm cursor-pointer"
                        title={t('members.changeRole')}
                      >
                        {Object.entries(ROLE_CONFIG)
                          .filter(([role]) => role !== 'pending')
                          .filter(([role]) => {
                            // Only allow managing roles below your own
                            if (currentUserRole === 'admin') return true;
                            if (currentUserRole === 'officer') return ['member', 'trial'].includes(role);
                            return false;
                          })
                          .map(([role, config]) => (
                            <option
                              key={role}
                              value={role}
                              title={config.description}
                            >
                              {t(`clan.${role}`) || config.label}
                            </option>
                          ))}
                      </select>

                      {onUpdateRank && gameRanks.length > 0 && (
                        canEditMemberRank(member.id, member.role) ? (
                          <select
                            value={member.guild_rank || ''}
                            onChange={(e) => onUpdateRank(member.id, e.target.value || null)}
                            className="bg-slate-800 border border-slate-600 rounded px-3 py-1 text-white text-sm cursor-pointer"
                            title="Guild Rank"
                          >
                            <option value="">No Rank</option>
                            {gameRanks
                              .filter((rank: any) => {
                                // Admins can assign any rank
                                if (currentUserRole === 'admin') return true;
                                
                                // Officers can assign ranks below their own rank
                                if (currentUserRole === 'officer') {
                                  const currentUserRankLevel = getCurrentUserRankHierarchy();
                                  const rankLevel = rank.hierarchy || 0;
                                  return rankLevel < currentUserRankLevel;
                                }
                                
                                return false;
                              })
                              .map((rank: any) => (
                                <option key={rank.id} value={rank.id}>
                                  {rank.name}
                                </option>
                              ))}
                          </select>
                        ) : (
                          <div className="px-3 py-1 bg-slate-900 border border-slate-700 rounded text-slate-400 text-sm">
                            {member.guild_rank 
                              ? gameRanks.find((r: any) => r.id === member.guild_rank)?.name || 'Unknown Rank'
                              : 'No Rank'}
                          </div>
                        )
                      )}

                      {onRemove && (
                        <button
                          onClick={() => onRemove(member.id)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm cursor-pointer"
                        >
                          {t('members.remove')}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )});
          })()}
        </div>
      </div>
    </div>
  );}
