'use client';

import { useState, use, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Users, Home, Loader2, AlertCircle, LogOut, Shield, Clock, UserPlus, Settings, Swords } from 'lucide-react';
import { useAuthContext } from '@/components/AuthProvider';
import { useLanguage } from '@/contexts/LanguageContext';
import { useClanData } from '@/hooks/useClanData';
import { useClanMembership } from '@/hooks/useClanMembership';
import { useEvents } from '@/hooks/useEvents';
import { CharactersTab } from './tabs/CharactersTab';
import { CharacterForm } from '@/components/CharacterForm';
import { EventsList } from '@/components/EventsList';
import { CharacterFiltersBar, CharacterFilters, DEFAULT_FILTERS, filterCharacters } from '@/components/CharacterFilters';
import { ClanSettings } from '@/components/ClanSettings';
import { RecruitmentSettings } from '@/components/RecruitmentSettings';
import { PermissionsSettings } from '@/components/PermissionsSettings';
import { ClanTabNav, Tab } from '@/components/ClanTabNav';
import { InlineFooter } from '@/components/Footer';
import { ROLE_CONFIG, ClanRole } from '@/lib/permissions';
import { ClanMatrix } from '@/components/ClanMatrix';
import { SiegeTabContent } from '@/components/SiegeTabContent';
import { EconomyTabContent } from '@/components/EconomyTabContent';
import { MoreTabContent } from '@/components/MoreTabContent';
import { createClan, getClanBySlug } from '@/lib/auth';
import { CharacterWithProfessions } from '@/lib/types';
import { ClanLoadingScreen } from '@/components/ClanLoadingScreen';
import { ClanErrorScreen } from '@/components/ClanErrorScreen';
import { ClanLoginScreen } from '@/components/ClanLoginScreen';
import { ClanCreateScreen } from '@/components/ClanCreateScreen';

// Tab type now imported from ClanTabNav

export default function ClanPage({ params }: { params: Promise<{ clan: string }> }) {
  const { clan: clanSlug } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, loading: authLoading, signIn, signOut } = useAuthContext();
  
  // Use state for activeTab, but let ClanTabNav manage URL sync
  const [activeTab, setActiveTab] = useState<Tab>('characters');
  const [clanId, setClanId] = useState<string | null>(null);
  const [clanExists, setClanExists] = useState<boolean | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<CharacterWithProfessions | null>(null);
  const [characterFilters, setCharacterFilters] = useState<CharacterFilters>(DEFAULT_FILTERS);
  const [checkError, setCheckError] = useState<string | null>(null);
  const { t } = useLanguage();

  // Handler for tab change
  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
  };

  // Handle tab query parameter changes from external navigation
  useEffect(() => {
    const tabParam = searchParams?.get('tab');
    if (tabParam && ['characters', 'events', 'parties', 'matrix', 'manage', 'siege', 'economy', 'more'].includes(tabParam)) {
      setActiveTab(tabParam as Tab);
    }
  }, [searchParams]);

  // Fetch clan ID first
  useEffect(() => {
    async function checkClan() {
      console.log('checkClan: starting for slug', clanSlug);
      setCheckError(null);
      try {
        // Add timeout to prevent infinite hanging
        const timeoutPromise = new Promise<{ id: string } | null>((_, reject) => {
          setTimeout(() => reject(new Error('Timeout checking clan')), 15000);
        });

        const clan = await Promise.race([
          getClanBySlug(clanSlug),
          timeoutPromise
        ]) as { id: string } | null;

        console.log('checkClan: result', clan);
        if (clan) {
          setClanId(clan.id);
          setClanExists(true);
        } else {
          setClanExists(false);
        }
      } catch (err) {
        console.error('Error checking clan:', err);
        setCheckError(err instanceof Error ? err.message : 'Failed to check clan');
        // Do NOT set clanExists to false here, or it will show "Create Clan"
      }
    }
    checkClan();
  }, [clanSlug]);

  const {
    membership,
    members: clanMembers,
    pendingMembers,
    loading: membershipLoading,
    canEdit,
    canManageMembers,
    canManageRoles,
    apply,
    acceptMember,
    rejectMember,
    updateRole,
    removeMember,
  } = useClanMembership(clanId, user?.id || null);

  const {
    clan,
    characters,
    loading: dataLoading,
    error,
    addCharacter,
    updateCharacter,
    deleteCharacter,
    setProfessionRank,
  } = useClanData(clanSlug);

  // Events hook
  const {
    events,
    announcements,
    loading: eventsLoading,
    createEvent,
    updateEvent,
    cancelEvent,
    deleteEvent,
    setRsvp,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
  } = useEvents(clanId, user?.id || null, clanSlug);

  // Helper function to get main character name for an alt (automatic based on user_id)
  const getMainCharacterName = (character: CharacterWithProfessions): string | undefined => {
    if (character.is_main || !character.user_id) return undefined;
    const mainChar = characters.find(c => c.user_id === character.user_id && c.is_main);
    return mainChar?.name;
  };

  // Helper function to get alts for a main character (automatic based on user_id)
  const getAltCharacters = (character: CharacterWithProfessions): Array<{ id: string; name: string }> => {
    if (!character.is_main || !character.user_id) return [];
    return characters
      .filter(c => c.user_id === character.user_id && !c.is_main && c.id !== character.id)
      .map(c => ({ id: c.id, name: c.name }));
  };



  // Loading state - include clanExists check for initial load
  const loading = (authLoading || membershipLoading || (clanExists === null) || (clanExists && dataLoading)) && !checkError;

  useEffect(() => {
    if (loading) {
      console.log('ClanPage loading state:', {
        authLoading,
        membershipLoading,
        clanExists,
        dataLoading,
        loading
      });
    }
  }, [loading, authLoading, membershipLoading, clanExists, dataLoading]);

  // Handle creating a new clan
  const handleCreateClan = async () => {
    if (!user) return;
    setIsCreating(true);
    try {
      const createdClan = await createClan(
        clanSlug,
        clanSlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        user.id
      );
      setClanId(createdClan.id);
      setClanExists(true);
      // Small delay to allow Supabase to propagate the new clan data
      // This prevents the "Connection Error" on immediate refresh
      await new Promise(resolve => setTimeout(resolve, 500));
      window.location.reload(); // Refresh to get proper membership state
    } catch (err) {
      console.error('Error creating clan:', err);
    } finally {
      setIsCreating(false);
    }
  };

  // Handle applying to join
  const handleApply = async () => {
    if (!user) return;
    setIsApplying(true);
    try {
      await apply();
    } catch (err) {
      console.error('Error applying:', err);
    } finally {
      setIsApplying(false);
    }
  };

  const displayName = profile?.display_name || profile?.discord_username || 'User';

  // Loading state
  if (loading) {
    return <ClanLoadingScreen message={t('common.loading')} />;
  }

  // Check Error state (Timeout / Connection)
  if (checkError) {
    return (
      <ClanErrorScreen
        title={t('clan.connectionError')}
        message={t('clan.connectionErrorMessage')}
        error={checkError}
        retryLabel={t('common.retryConnection')}
        onRetry={() => window.location.reload()}
        homeLabel={t('common.returnHome')}
      />
    );
  }

  // Not logged in
  if (!user) {
    return (
      <ClanLoginScreen
        title={t('clan.loginRequired')}
        message={t('clan.signInToAccess', { name: clanSlug })}
        onSignIn={() => {
          localStorage.setItem('authRedirectTo', `/${clanSlug}`);
          signIn();
        }}
        signInLabel={t('common.continueWithDiscord')}
        homeLabel={t('common.returnHome')}
      />
    );
  }

  // Clan doesn't exist - offer to create
  if (!clanExists) {
    return (
      <ClanCreateScreen
        title={t('clan.createNew')}
        message={t('clan.createDescription', { name: clanSlug })}
        onCreate={handleCreateClan}
        creating={isCreating}
        createLabel={t('clan.create')}
        adminNote={t('clan.youWillBeAdmin')}
        homeLabel={t('common.returnHome')}
      />
    );
  }

  // Not a member - offer to apply
  if (!membership) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <Users className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">{t('clan.joinClan')}</h2>
          <p className="text-slate-400 mb-6">
            {t('clan.applyDescription', { name: clan?.name || clanSlug })}
          </p>
          <button
            onClick={handleApply}
            disabled={isApplying}
            className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            {isApplying ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <UserPlus className="w-5 h-5" />
            )}
            {t('clan.applyToJoin')}
          </button>
          <Link
            href="/"
            className="inline-block mt-4 text-slate-400 hover:text-white transition-colors"
          >
            ← {t('common.returnHome')}
          </Link>
        </div>
      </div>
    );
  }

  // Pending approval
  if (membership.role === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <Clock className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">{t('clan.applicationPending')}</h2>
          <p className="text-slate-400 mb-6">
            {t('clan.pendingApproval', { name: clan?.name || clanSlug })}
          </p>
          <div className="bg-slate-800/50 rounded-lg p-4 text-sm text-slate-400">
            {t('clan.accessAfterApproval')}
          </div>
          <Link
            href="/"
            className="inline-block mt-6 text-slate-400 hover:text-white transition-colors"
          >
            ← {t('common.returnHome')}
          </Link>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">{t('clan.errorLoading')}</h2>
          <p className="text-slate-400 mb-4">{error}</p>
          <Link
            href="/"
            className="inline-block mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white transition-colors cursor-pointer"
          >
            {t('common.returnHome')}
          </Link>
        </div>
      </div>
    );
  }

  // Full clan dashboard
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header - fixed at top */}
      <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-800 shrink-0 z-50">
        <div className="max-w-7xl mx-auto px-3 md:px-4 py-2 md:py-4">
          <div className="flex items-center justify-between">
            {/* Left: Navigation */}
            <div className="flex items-center gap-2 md:gap-4">
              <Link
                href="/"
                className="p-1.5 md:p-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Home"
              >
                <Home className="w-5 h-5 md:w-5 md:h-5" />
              </Link>
              <div>
                <h1 className="font-display text-base md:text-xl font-semibold text-white">
                  {clan?.name || clanSlug}
                </h1>
                <p className="text-slate-500 text-xs md:text-sm hidden sm:block">
                  {characters.length} characters • 
                  <span className={`ml-1 ${
                    membership.role === 'admin' ? 'text-orange-400' :
                    membership.role === 'officer' ? 'text-purple-400' :
                    'text-cyan-400'
                  }`}>
                    {membership.role}
                  </span>
                </p>
              </div>
            </div>

            {/* Right: User info */}
            <div className="flex items-center gap-1 md:gap-3">
              <span className="text-slate-300 text-sm hidden sm:inline">{displayName}</span>
              <Link
                href="/settings"
                className="p-1.5 md:p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Settings"
              >
                <Settings className="w-4 h-4 md:w-[18px] md:h-[18px]" />
              </Link>
              <button
                onClick={() => signOut()}
                className="p-1.5 md:p-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Sign out"
              >
                <LogOut className="w-4 h-4 md:w-[18px] md:h-[18px]" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content - scrollable area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 py-6 pb-4">
          {activeTab === 'characters' ? (
            <CharactersTab
              characters={characters}
              addCharacter={addCharacter}
              setEditingCharacter={setEditingCharacter}
              characterFilters={characterFilters}
              setCharacterFilters={setCharacterFilters}
            />
          ) : activeTab === 'events' ? (
            <EventsList
              events={events}
              announcements={announcements}
              timezone={profile?.timezone || 'UTC'}
              clanId={clanId!}
              userId={user.id}
              canManage={canManageMembers}
              onCreateEvent={async (eventData, sendDiscordNotification) => {
                console.log('ClanPage onCreateEvent called with sendDiscordNotification:', sendDiscordNotification, 'type:', typeof sendDiscordNotification);
                await createEvent(eventData, sendDiscordNotification);
              }}
              onUpdateEvent={updateEvent}
              onCancelEvent={cancelEvent}
              onDeleteEvent={deleteEvent}
              onRsvp={setRsvp}
              onCreateAnnouncement={async (announcementData, sendDiscordNotification) => {
                await createAnnouncement(announcementData, sendDiscordNotification);
              }}
              onUpdateAnnouncement={updateAnnouncement}
              onDeleteAnnouncement={deleteAnnouncement}
            />
          ) : activeTab === 'matrix' ? (
            <ClanMatrix members={characters} />
          ) : activeTab === 'economy' ? (
            <EconomyTabContent
              clanId={clanId!}
              isOfficer={canManageMembers}
            />
          ) : activeTab === 'more' ? (
            <MoreTabContent
              clanId={clanId!}
              userId={user.id}
              characters={characters}
              isOfficer={canManageMembers}
            />
          ) : activeTab === 'manage' && canManageMembers ? (
            <div className="space-y-6">
              {/* Title */}
              <div>
                <h2 className="text-2xl font-bold text-white">{t('nav.manage')}</h2>
                <p className="text-slate-400 mt-1">Manage clan members, roles, and settings</p>
              </div>

              {/* Member Management */}
              <ManageTab
                members={clanMembers}
                pendingMembers={pendingMembers}
                onAccept={acceptMember}
                onReject={rejectMember}
                onUpdateRole={canManageRoles ? updateRole : undefined}
                onRemove={canManageRoles ? removeMember : undefined}
                currentUserId={user.id}
                currentUserRole={membership?.role || 'member'}
                t={t}
              />

              {/* Permissions Settings (Admin only) */}
              {membership?.role === 'admin' && clan && (
                <PermissionsSettings
                  clanId={clan.id}
                  userRole={membership?.role || 'member'}
                />
              )}
              
              {/* Clan Settings (Admin only) */}
              {membership?.role === 'admin' && clan && (
                <ClanSettings
                  clanId={clan.id}
                  currentWebhookUrl={clan.discord_webhook_url || ''}
                  notifyOnEvents={clan.notify_on_events ?? true}
                  notifyOnAnnouncements={clan.notify_on_announcements ?? true}
                  announcementRoleId={clan.discord_announcement_role_id || ''}
                />
              )}
              
              {/* Recruitment Settings (Admin only) */}
              {membership?.role === 'admin' && clan && (
                <RecruitmentSettings
                  clanId={clan.id}
                  clanSlug={clanSlug}
                />
              )}
            </div>
          ) : null}
        </div>
      </main>

      {/* Bottom navigation and Footer - fixed at bottom */}
      <div className="shrink-0">
        <ClanTabNav
          canManage={canManageMembers}
          onTabChange={handleTabChange}
          initialTab={activeTab}
        />
        <InlineFooter variant="matching" />
      </div>

      {editingCharacter && (
        <CharacterForm
          initialData={{
            name: editingCharacter.name,
            race: editingCharacter.race,
            primary_archetype: editingCharacter.primary_archetype,
            secondary_archetype: editingCharacter.secondary_archetype,
            level: editingCharacter.level,
            is_main: editingCharacter.is_main,
          }}
          onSubmit={async (data) => {
            await updateCharacter(editingCharacter.id, data);
            setEditingCharacter(null);
          }}
          onCancel={() => setEditingCharacter(null)}
          isEditing
        />
      )}
    </div>
  );
}

function TabButton({
  icon,
  label,
  isActive,
  onClick,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
        isActive
          ? 'bg-orange-500 text-white'
          : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  );
}

function ManageTab({
  members,
  pendingMembers,
  onAccept,
  onReject,
  onUpdateRole,
  onRemove,
  currentUserId,
  currentUserRole,
  t,
}: {
  members: Array<{
    id: string;
    user_id: string;
    role: string | null;
    is_creator: boolean;
    user: { display_name: string | null; discord_username: string | null; discord_avatar: string | null } | null;
  }>;
  pendingMembers: typeof members;
  onAccept: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  onUpdateRole?: (id: string, role: ClanRole) => Promise<void>;
  onRemove?: (id: string) => Promise<void>;
  currentUserId: string;
  currentUserRole: ClanRole;
  t: (key: string) => string;
}) {
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
            // Sort members by role (using role hierarchy) then display name
            const getRoleRank = (role: string | null) => {
              const hierarchy = {
                admin: 4,
                officer: 3,
                member: 2,
                trial: 1,
                pending: 0,
              };
              return role && hierarchy.hasOwnProperty(role) ? hierarchy[role as keyof typeof hierarchy] : -1;
            };
            return members
              .slice()
              .sort((a, b) => {
                const roleDiff = getRoleRank(b.role) - getRoleRank(a.role);
                if (roleDiff !== 0) return roleDiff;
                const nameA = (a.user?.display_name || a.user?.discord_username || '').toLowerCase();
                const nameB = (b.user?.display_name || b.user?.discord_username || '').toLowerCase();
                return nameA.localeCompare(nameB);
              })
              .map((member) => (
                <div
                  key={member.id}
                  className={[
                    "bg-slate-900/80",
                    "backdrop-blur-sm",
                    "rounded-lg",
                    "border",
                    (() => {
                      const validRole = (role: string | null): role is ClanRole =>
                        role !== null && Object.prototype.hasOwnProperty.call(ROLE_CONFIG, role);
                      const roleKey: ClanRole = validRole(member.role) ? member.role : 'member';
                      return ROLE_CONFIG[roleKey].borderColor;
                    })(),
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
                {(() => {
                  const validRole = (role: string | null): role is ClanRole =>
                    role !== null && Object.prototype.hasOwnProperty.call(ROLE_CONFIG, role);
                  const roleKey: ClanRole = validRole(member.role) ? member.role : 'member';
                  const config = ROLE_CONFIG[roleKey];
                  return <span className={config.color}>{String.fromCharCode(9679)}</span>;
                })()}
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
                  <span className={`ml-2 text-sm ${ROLE_CONFIG[member.role as ClanRole]?.color || 'text-slate-400'}`}> {member.role}{member.is_creator && ' (creator)'}</span>
                </div>
              </div>
              {onUpdateRole && member.user_id !== currentUserId && (
                <div className="flex items-center gap-2">
                  <select
                    value={member.role || 'member'}
                    onChange={(e) => onUpdateRole(member.id, e.target.value as ClanRole)}
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
              ));
            })()}
        </div>
      </div>
    </div>
  );
}
