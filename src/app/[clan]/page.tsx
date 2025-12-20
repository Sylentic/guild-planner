'use client';

import { useState, use, useEffect } from 'react';
import Link from 'next/link';
import { Users, Grid3X3, Home, Loader2, AlertCircle, LogOut, Shield, Clock, UserPlus, Settings, Swords, Calendar } from 'lucide-react';
import { useAuthContext } from '@/components/AuthProvider';
import { useClanData } from '@/hooks/useClanData';
import { useClanMembership } from '@/hooks/useClanMembership';
import { useEvents } from '@/hooks/useEvents';
import { CharacterCard } from '@/components/MemberCard';
import { AddCharacterButton } from '@/components/AddCharacterButton';
import { CharacterForm } from '@/components/CharacterForm';
import { ClanMatrix } from '@/components/ClanMatrix';
import { EventsList } from '@/components/EventsList';
import { CharacterFiltersBar, CharacterFilters, DEFAULT_FILTERS, filterCharacters } from '@/components/CharacterFilters';
import { ClanSettings } from '@/components/ClanSettings';
import { createClan, getClanBySlug } from '@/lib/auth';
import { CharacterWithProfessions } from '@/lib/types';

type Tab = 'characters' | 'events' | 'matrix' | 'manage';

export default function ClanPage({ params }: { params: Promise<{ clan: string }> }) {
  const { clan: clanSlug } = use(params);
  const { user, profile, loading: authLoading, signIn, signOut } = useAuthContext();
  const [activeTab, setActiveTab] = useState<Tab>('characters');
  const [clanId, setClanId] = useState<string | null>(null);
  const [clanExists, setClanExists] = useState<boolean | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<CharacterWithProfessions | null>(null);
  const [characterFilters, setCharacterFilters] = useState<CharacterFilters>(DEFAULT_FILTERS);

  // Fetch clan ID first
  useEffect(() => {
    async function checkClan() {
      try {
        const clan = await getClanBySlug(clanSlug);
        if (clan) {
          setClanId(clan.id);
          setClanExists(true);
        } else {
          setClanExists(false);
        }
      } catch (err) {
        console.error('Error checking clan:', err);
        setClanExists(false);
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
    setRsvp,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
  } = useEvents(clanId, user?.id || null);

  const loading = authLoading || membershipLoading || dataLoading || clanExists === null;

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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-orange-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <Shield className="w-12 h-12 text-orange-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Login Required</h2>
          <p className="text-slate-400 mb-6">
            Sign in with Discord to access <span className="text-white font-medium">{clanSlug}</span>
          </p>
          <button
            onClick={() => {
              localStorage.setItem('authRedirectTo', `/${clanSlug}`);
              signIn();
            }}
            className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-[#5865F2] hover:bg-[#4752C4] text-white font-medium rounded-lg transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
            Continue with Discord
          </button>
          <Link
            href="/"
            className="inline-block mt-4 text-slate-400 hover:text-white transition-colors"
          >
            ← Return Home
          </Link>
        </div>
      </div>
    );
  }

  // Clan doesn't exist - offer to create
  if (!clanExists) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <UserPlus className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Create New Clan</h2>
          <p className="text-slate-400 mb-6">
            The clan <span className="text-white font-medium">{clanSlug}</span> doesn&apos;t exist yet.
            Would you like to create it?
          </p>
          <button
            onClick={handleCreateClan}
            disabled={isCreating}
            className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            {isCreating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Shield className="w-5 h-5" />
            )}
            Create Clan
          </button>
          <p className="text-slate-500 text-sm mt-3">
            You will become the clan Admin
          </p>
          <Link
            href="/"
            className="inline-block mt-4 text-slate-400 hover:text-white transition-colors"
          >
            ← Return Home
          </Link>
        </div>
      </div>
    );
  }

  // Not a member - offer to apply
  if (!membership) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <Users className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Join Clan</h2>
          <p className="text-slate-400 mb-6">
            Apply to join <span className="text-white font-medium">{clan?.name || clanSlug}</span>.
            An admin will review your application.
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
            Apply to Join
          </button>
          <Link
            href="/"
            className="inline-block mt-4 text-slate-400 hover:text-white transition-colors"
          >
            ← Return Home
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
          <h2 className="text-xl font-semibold text-white mb-2">Application Pending</h2>
          <p className="text-slate-400 mb-6">
            Your application to join <span className="text-white font-medium">{clan?.name || clanSlug}</span> is pending review by an admin or officer.
          </p>
          <div className="bg-slate-800/50 rounded-lg p-4 text-sm text-slate-400">
            You&apos;ll be able to access clan data once approved.
          </div>
          <Link
            href="/"
            className="inline-block mt-6 text-slate-400 hover:text-white transition-colors"
          >
            ← Return Home
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
          <h2 className="text-xl font-semibold text-white mb-2">Error Loading Clan</h2>
          <p className="text-slate-400 mb-4">{error}</p>
          <Link
            href="/"
            className="inline-block mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white transition-colors cursor-pointer"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  // Full clan dashboard
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Navigation */}
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="p-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Home"
              >
                <Home size={20} />
              </Link>
              <div>
                <h1 className="font-display text-xl font-semibold text-white">
                  {clan?.name || clanSlug}
                </h1>
                <p className="text-slate-500 text-sm">
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

            {/* Center: Tab navigation */}
            <div className="flex gap-1 bg-slate-800/50 rounded-lg p-1">
              <TabButton
                icon={<Swords size={18} />}
                label="Characters"
                isActive={activeTab === 'characters'}
                onClick={() => setActiveTab('characters')}
              />
              <TabButton
                icon={<Calendar size={18} />}
                label="Events"
                isActive={activeTab === 'events'}
                onClick={() => setActiveTab('events')}
                badge={events.filter(e => !e.is_cancelled && new Date(e.starts_at) > new Date()).length || undefined}
              />
              <TabButton
                icon={<Grid3X3 size={18} />}
                label="Professions"
                isActive={activeTab === 'matrix'}
                onClick={() => setActiveTab('matrix')}
              />
              {canManageMembers && (
                <TabButton
                  icon={<Settings size={18} />}
                  label="Manage"
                  isActive={activeTab === 'manage'}
                  onClick={() => setActiveTab('manage')}
                  badge={pendingMembers.length > 0 ? pendingMembers.length : undefined}
                />
              )}
            </div>

            {/* Right: User info */}
            <div className="flex items-center gap-3">
              <span className="text-slate-300 text-sm hidden sm:inline">{displayName}</span>
              <button
                onClick={() => signOut()}
                className="p-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Sign out"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'characters' ? (
          <div className="space-y-4">
            {canEdit && <AddCharacterButton onAdd={addCharacter} />}
            
            {/* Character Filters */}
            {characters.length > 0 && (
              <CharacterFiltersBar
                filters={characterFilters}
                onChange={setCharacterFilters}
                characterCount={characters.length}
                filteredCount={filterCharacters(characters, characterFilters).length}
              />
            )}
            
            {characters.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Swords className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No characters yet. Add your first guild character above!</p>
              </div>
            ) : filterCharacters(characters, characterFilters).length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Swords className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No characters match your filters.</p>
              </div>
            ) : (
              filterCharacters(characters, characterFilters).map((character) => (
                <CharacterCard
                  key={character.id}
                  character={character}
                  onUpdate={canEdit ? async (id, name) => updateCharacter(id, { name }) : async () => {}}
                  onDelete={canEdit ? deleteCharacter : async () => {}}
                  onSetProfessionRank={setProfessionRank}
                  onEdit={canEdit ? setEditingCharacter : undefined}
                  readOnly={!canEdit}
                />
              ))
            )}
          </div>
        ) : activeTab === 'events' ? (
          <EventsList
            events={events}
            announcements={announcements}
            timezone={profile?.timezone || 'UTC'}
            clanId={clanId!}
            userId={user.id}
            canManage={canManageMembers}
            onCreateEvent={async (eventData) => {
              await createEvent(eventData);
            }}
            onUpdateEvent={updateEvent}
            onCancelEvent={cancelEvent}
            onRsvp={setRsvp}
            onCreateAnnouncement={createAnnouncement}
            onUpdateAnnouncement={updateAnnouncement}
            onDeleteAnnouncement={deleteAnnouncement}
          />
        ) : activeTab === 'matrix' ? (
          <ClanMatrix members={characters} />
        ) : activeTab === 'manage' && canManageMembers ? (
          <div className="space-y-6">
            {/* Member Management */}
            <ManageTab
              members={clanMembers}
              pendingMembers={pendingMembers}
              onAccept={acceptMember}
              onReject={rejectMember}
              onUpdateRole={canManageRoles ? updateRole : undefined}
              onRemove={canManageRoles ? removeMember : undefined}
              currentUserId={user.id}
            />
            
            {/* Clan Settings (Admin only) */}
            {membership?.role === 'admin' && clan && (
              <ClanSettings
                clanId={clan.id}
                currentWebhookUrl={clan.discord_webhook_url || ''}
                notifyOnEvents={clan.notify_on_events ?? true}
                notifyOnAnnouncements={clan.notify_on_announcements ?? true}
              />
            )}
          </div>
        ) : null}
      </main>

      {/* Edit character modal */}
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
  onUpdateRole?: (id: string, role: 'admin' | 'officer' | 'member') => Promise<void>;
  onRemove?: (id: string) => Promise<void>;
  currentUserId: string;
}) {
  return (
    <div className="space-y-6">
      {/* Pending Applications */}
      {pendingMembers.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="text-yellow-400" size={20} />
            Pending Applications ({pendingMembers.length})
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
                    Accept
                  </button>
                  <button
                    onClick={() => onReject(member.id)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm cursor-pointer"
                  >
                    Reject
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
          Members ({members.length})
        </h2>
        <div className="space-y-2">
          {members.map((member) => (
            <div
              key={member.id}
              className="bg-slate-900/80 border border-slate-700 rounded-lg p-4 flex items-center justify-between"
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
                <div>
                  <span className="text-white">
                    {member.user?.display_name || member.user?.discord_username || 'Unknown'}
                  </span>
                  <span className={`ml-2 text-sm ${
                    member.role === 'admin' ? 'text-orange-400' :
                    member.role === 'officer' ? 'text-purple-400' :
                    'text-slate-400'
                  }`}>
                    {member.role}
                    {member.is_creator && ' (creator)'}
                  </span>
                </div>
              </div>
              {onUpdateRole && member.user_id !== currentUserId && (
                <div className="flex items-center gap-2">
                  <select
                    value={member.role || 'member'}
                    onChange={(e) => onUpdateRole(member.id, e.target.value as 'admin' | 'officer' | 'member')}
                    className="bg-slate-800 border border-slate-600 rounded px-3 py-1 text-white text-sm cursor-pointer"
                  >
                    <option value="member">Member</option>
                    <option value="officer">Officer</option>
                    <option value="admin">Admin</option>
                  </select>
                  {onRemove && (
                    <button
                      onClick={() => onRemove(member.id)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
