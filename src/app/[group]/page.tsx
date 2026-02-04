
"use client";
import { useState, use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, LogOut, ChevronRight, Home, Plus, Trash2, Shield, Loader, Archive } from 'lucide-react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { useLanguage } from '@/contexts/LanguageContext';
import { GameIcon } from '@/components/common/GameIcon';
import { getGroupBySlug } from '@/lib/auth';
import { useGroupMembership } from '@/hooks/useGroupMembership';
import { usePermissions } from '@/hooks/usePermissions';
import { getGroupGames, getGroupGamesWithStatus, addGameToGroup, removeGameFromGroup } from '@/lib/group-games';
import { getAllGames } from '@/lib/games';
import { ClanLoadingScreen } from '@/components/screens/ClanLoadingScreen';
import { ClanErrorScreen } from '@/components/screens/ClanErrorScreen';
import { ClanLoginScreen } from '@/components/screens/ClanLoginScreen';
import { InlineFooter } from '@/components/layout/Footer';


export default function GroupPage({ params }: { params: Promise<{ group: string }> }) {
  const { group: groupSlug } = use(params);
  const router = useRouter();
  const { user, profile, loading: authLoading, signIn, signOut } = useAuthContext();
  const { t } = useLanguage();
  const ALL_AVAILABLE_GAMES = getAllGames().map(g => ({ slug: g.id, name: g.name, icon: g.icon, iconUrl: g.iconUrl }));

  const [groupId, setGroupId] = useState<string | null>(null);
  const [groupData, setGroupData] = useState<any>(null);
  const [groupExists, setGroupExists] = useState<boolean | null>(null);
  const [checkError, setCheckError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [enabledGames, setEnabledGames] = useState<string[]>(ALL_AVAILABLE_GAMES.map(g => g.slug)); // Default to all games
  const [gamesWithStatus, setGamesWithStatus] = useState<Array<{ slug: string; archived: boolean }>>([]);
  const [showAddGame, setShowAddGame] = useState(false);
  const [loadingGames, setLoadingGames] = useState(false);
  const [addingGame, setAddingGame] = useState<string | null>(null);
  const [removingGame, setRemovingGame] = useState<string | null>(null);

  // Fetch group data
  useEffect(() => {
    async function checkGroup() {
      console.log('GroupOverviewPage: checking group', groupSlug);
      setCheckError(null);
      setLoading(true);
      try {
        // Add timeout to prevent infinite hanging
        const timeoutPromise = new Promise<{ id: string } | null>((_, reject) => {
          setTimeout(() => reject(new Error('Timeout checking group')), 15000);
        });

        const group = await Promise.race([
          getGroupBySlug(groupSlug),
          timeoutPromise
        ]) as any | null;

        console.log('GroupOverviewPage: group result', group);
        if (group) {
          setGroupId(group.id);
          setGroupData(group);
          setGroupExists(true);
          
          // Load enabled games from database
          await loadGroupGames(group.id);
        } else {
          setGroupExists(false);
        }
      } catch (err) {
        console.error('Error checking group:', err);
        setCheckError(err instanceof Error ? err.message : 'Failed to check group');
      } finally {
        setLoading(false);
      }
    }
    checkGroup();
  }, [groupSlug]);

  // Load group games from database
  const loadGroupGames = async (gid: string) => {
    setLoadingGames(true);
    try {
      const gamesStatus = await getGroupGamesWithStatus(gid);
      // If games are configured, use them; otherwise show all available games
      if (gamesStatus.length > 0) {
        setEnabledGames(gamesStatus.map(g => g.game_slug));
        setGamesWithStatus(gamesStatus.map(g => ({ slug: g.game_slug, archived: g.archived })));
      } else {
        setEnabledGames(ALL_AVAILABLE_GAMES.map(g => g.slug));
        setGamesWithStatus(ALL_AVAILABLE_GAMES.map(g => ({ slug: g.slug, archived: false })));
      }
    } catch (err) {
      console.error('Error loading group games:', err);
      // On error, show all games by default
      setEnabledGames(ALL_AVAILABLE_GAMES.map(g => g.slug));
      setGamesWithStatus(ALL_AVAILABLE_GAMES.map(g => ({ slug: g.slug, archived: false })));
    } finally {
      setLoadingGames(false);
    }
  };

  // Add game to group
  const handleAddGame = async (gameSlug: string) => {
    if (!groupId) return;
    
    setAddingGame(gameSlug);
    try {
      const success = await addGameToGroup(groupId, gameSlug);
      if (success) {
        setEnabledGames([...enabledGames, gameSlug]);
        setShowAddGame(false);
      }
    } catch (err) {
      console.error('Error adding game:', err);
    } finally {
      setAddingGame(null);
    }
  };

  // Remove game from group
  const handleRemoveGame = async (gameSlug: string) => {
    if (!groupId) return;
    
    setRemovingGame(gameSlug);
    try {
      const success = await removeGameFromGroup(groupId, gameSlug);
      if (success) {
        setEnabledGames(enabledGames.filter(g => g !== gameSlug));
      }
    } catch (err) {
      console.error('Error removing game:', err);
    } finally {
      setRemovingGame(null);
    }
  };

  // Get membership info to check permissions
  const {
    membership,
    loading: membershipLoading,
  } = useGroupMembership(groupId, user?.id || null);

  const { hasPermission } = usePermissions(groupId || undefined);
  const canEditSettings = hasPermission('settings_edit');

  const displayName = profile?.display_name || profile?.discord_username || 'User';

  // Loading state
  if (loading || authLoading) {
    return <ClanLoadingScreen message={t('common.loading')} />;
  }

  // Check Error state (Timeout / Connection)
  if (checkError) {
    return (
      <ClanErrorScreen
        title={t('group.connectionError')}
        message={t('group.connectionErrorMessage')}
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
        title={t('group.loginRequired')}
        message={t('group.signInToAccess', { name: groupSlug })}
        onSignIn={() => {
          localStorage.setItem('authRedirectTo', `/${groupSlug}`);
          signIn();
        }}
        signInLabel={t('common.continueWithDiscord')}
        homeLabel={t('common.returnHome')}
      />
    );
  }

  // Group doesn't exist
  if (!groupExists) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">{t('group.notFound')}</h2>
          <p className="text-slate-400 mb-6">
            {t('group.doesNotExist', { name: groupSlug })}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white transition-colors cursor-pointer"
          >
            <Home className="w-5 h-5" />
            {t('common.returnHome')}
          </Link>
        </div>
      </div>
    );
  }

  // Group exists - show game selector
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {groupData?.group_icon_url && (
              <img
                src={groupData.group_icon_url}
                alt={groupData.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold text-white">{groupData?.name || groupSlug}</h1>
              <p className="text-sm text-slate-400">Select a game</p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors cursor-pointer"
            title="Sign out"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden sm:inline text-sm">{displayName}</span>
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white mb-2">Available Games</h2>
            <p className="text-slate-400 text-sm">Click on a game to view your group's information for that game.</p>
          </div>
          {canEditSettings && (
            <button
              onClick={() => setShowAddGame(!showAddGame)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors cursor-pointer"
              title="Add a game to this group"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline text-sm">Add Game</span>
            </button>
          )}
        </div>

        {/* Add game dialog */}
        {showAddGame && canEditSettings && (
          <div className="mb-6 p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
            <h3 className="text-white font-semibold mb-4">Add a game to this group:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {ALL_AVAILABLE_GAMES.filter(g => !enabledGames.includes(g.slug)).map((game) => (
                <button
                  key={game.slug}
                  onClick={() => handleAddGame(game.slug)}
                  disabled={addingGame === game.slug}
                  className="text-left p-3 bg-slate-700/50 hover:bg-slate-600/50 disabled:opacity-50 disabled:cursor-not-allowed rounded border border-slate-600 hover:border-orange-500 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <GameIcon 
                      icon={game.icon}
                      iconUrl={game.iconUrl}
                      alt={game.name}
                      size={32}
                    />
                    <span className="text-white font-medium">{game.name}</span>
                  </div>
                  {addingGame === game.slug && <Loader className="w-4 h-4 text-orange-400 animate-spin" />}
                </button>
              ))}
            </div>
            {ALL_AVAILABLE_GAMES.every(g => enabledGames.includes(g.slug)) && (
              <p className="text-slate-400 text-sm">All available games are already enabled.</p>
            )}
          </div>
        )}

        {/* Game cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ALL_AVAILABLE_GAMES.filter(g => enabledGames.includes(g.slug)).map((game) => {
            const gameStatus = gamesWithStatus.find(gs => gs.slug === game.slug);
            const isArchived = gameStatus?.archived || false;
            
            return (
            <div
              key={game.slug}
              className="group relative overflow-hidden rounded-lg border border-slate-700 bg-slate-800/50 p-6 text-left"
            >
              {/* Background gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* Archived badge */}
              {isArchived && (
                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-amber-900/40 border border-amber-700/50 rounded-full">
                  <Archive className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-medium text-amber-300">Archived</span>
                </div>
              )}

              {/* Content */}
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => router.push(`/${groupSlug}/${game.slug}`)}
                    className="flex-1 text-left group/link cursor-pointer"
                  >
                    <div className="mb-3">
                      <GameIcon 
                        icon={game.icon}
                        iconUrl={game.iconUrl}
                        alt={game.name}
                        size={80}
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-white group-hover/link:text-cyan-400 transition-colors">
                      {game.name}
                    </h3>
                  </button>
                  <button
                    onClick={() => router.push(`/${groupSlug}/${game.slug}`)}
                    className="text-slate-500 hover:text-cyan-400 transition-colors transform group-hover:translate-x-1 self-center"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
                <button
                  onClick={() => router.push(`/${groupSlug}/${game.slug}`)}
                  className="text-sm text-slate-400 hover:text-slate-300 cursor-pointer w-full text-left"
                >
                  View members, events, and manage guild operations
                </button>
              </div>

              {/* Admin delete button */}
              {canEditSettings && !isArchived && (
                <button
                  onClick={() => handleRemoveGame(game.slug)}
                  disabled={removingGame === game.slug}
                  className="absolute top-2 right-2 p-2 opacity-0 group-hover:opacity-100 bg-red-500/20 hover:bg-red-500/40 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-all"
                  title="Remove this game from the group"
                >
                  {removingGame === game.slug ? (
                    <Loader className="w-4 h-4 text-red-400 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 text-red-400" />
                  )}
                </button>
              )}
            </div>
          );
          })}
        </div>

        {enabledGames.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400 mb-4">No games enabled for this group yet.</p>
            {canEditSettings && (
              <button
                onClick={() => setShowAddGame(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add a Game
              </button>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-700 bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <InlineFooter variant="matching" />
        </div>
      </footer>
    </div>
  );
}


