
"use client";
import { AchievementsTab } from './tabs/AchievementsTab';
import { ClanHeader } from './ClanHeader';
import { ManageTab } from './tabs/ManageTab';
import { GuildIconUploaderWrapper } from './GuildIconUploaderWrapper';
import { BuildsTab } from './tabs/BuildsTab';
import { AlliancesTab } from './tabs/AlliancesTab';

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
import { PartiesTab } from './tabs/PartiesTab';
import { CharacterEditModal } from './CharacterEditModal';
import { EventsList } from '@/components/EventsList';
import { CharacterFiltersBar, CharacterFilters, DEFAULT_FILTERS, filterCharacters } from '@/components/CharacterFilters';
import { ClanSettings } from '@/components/ClanSettings';
import { RecruitmentSettings } from '@/components/RecruitmentSettings';
import { PermissionsSettings } from '@/components/PermissionsSettings';
import { ClanTabNav } from '@/components/ClanTabNav';
import { Tab } from '@/components/tabs';
import { InlineFooter } from '@/components/Footer';
import { ROLE_CONFIG, ClanRole } from '@/lib/permissions';
import { ClanMatrix } from '@/components/ClanMatrix';
import { SiegeTab } from './tabs/SiegeTab';
import { EconomyTab } from './tabs/EconomyTab';
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

  // Guild icon state for live update
  const [guildIconUrl, setGuildIconUrl] = useState(clan?.guild_icon_url || '');

  // Refresh the icon from the DB after upload
  async function refreshGuildIcon() {
    if (!clanSlug) return;
    const latest = await getClanBySlug(clanSlug);
    if (latest?.guild_icon_url) setGuildIconUrl(latest.guild_icon_url);
  }

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
      <ClanHeader
        clanName={clan?.name || ''}
        clanSlug={clanSlug}
        characterCount={characters.length}
        role={membership.role || ''}
        displayName={displayName}
        onSignOut={signOut}
        guildIconUrl={guildIconUrl}
      />

      {/* Main content - scrollable area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 py-6 pb-4">
            {activeTab === 'characters' ? (
              <CharactersTab
                clanId={clanId!}
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
          ) : activeTab === 'parties' ? (
            <PartiesTab
              clanId={clanId!}
              characters={characters}
              userId={user.id}
              canManage={canManageMembers}
            />
          ) : activeTab === 'siege' ? (
            <SiegeTab
              clanId={clanId!}
              characters={characters}
              userId={user.id}
            />
          ) : activeTab === 'achievements' ? (
            <AchievementsTab
              clanId={clanId!}
              isOfficer={canManageMembers}
            />
          ) : activeTab === 'alliances' ? (
            <AlliancesTab
              clanId={clanId!}
              isOfficer={canManageMembers}
            />
          ) : activeTab === 'builds' ? (
            <BuildsTab
              clanId={clanId!}
            />
          ) : activeTab === 'matrix' ? (
            <ClanMatrix members={characters} />
          ) : activeTab === 'economy' ? (
            <EconomyTab
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

              {/* Guild Icon Uploader (Admin only) */}
              {membership?.role === 'admin' && clan && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Guild Icon</h3>
                  <GuildIconUploaderWrapper
                    clanId={clan.id}
                    currentUrl={guildIconUrl}
                    onIconChange={refreshGuildIcon}
                  />
                </div>
              )}

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

      <CharacterEditModal
        editingCharacter={editingCharacter}
        onSubmit={async (id, data) => {
          await updateCharacter(id, data);
          setEditingCharacter(null);
        }}
        onCancel={() => setEditingCharacter(null)}
      />
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

