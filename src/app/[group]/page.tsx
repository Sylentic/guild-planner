
"use client";
import { useState, use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, LogOut, ChevronRight, Home } from 'lucide-react';
import { useAuthContext } from '@/components/AuthProvider';
import { useLanguage } from '@/contexts/LanguageContext';
import { getGroupBySlug } from '@/lib/auth';
import { ClanLoadingScreen } from '@/components/ClanLoadingScreen';
import { ClanErrorScreen } from '@/components/ClanErrorScreen';
import { ClanLoginScreen } from '@/components/ClanLoginScreen';
import { InlineFooter } from '@/components/Footer';

// Game configuration - could be expanded to support more games
const SUPPORTED_GAMES = [
  { slug: 'aoc', name: 'Ashes of Creation', icon: '⚔️' },
  // Add more games as needed
  // { slug: 'bdo', name: 'Black Desert Online', icon: '🗡️' },
];


export default function GroupPage({ params }: { params: Promise<{ group: string }> }) {
  const { group: groupSlug } = use(params);
  const router = useRouter();
  const { user, profile, loading: authLoading, signIn, signOut } = useAuthContext();
  const { t } = useLanguage();

  const [groupId, setGroupId] = useState<string | null>(null);
  const [groupData, setGroupData] = useState<any>(null);
  const [groupExists, setGroupExists] = useState<boolean | null>(null);
  const [checkError, setCheckError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-2">Available Games</h2>
          <p className="text-slate-400 text-sm">Click on a game to view your guild's chapter</p>
        </div>

        {/* Game cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SUPPORTED_GAMES.map((game) => (
            <button
              key={game.slug}
              onClick={() => router.push(`/${groupSlug}/${game.slug}`)}
              className="group relative overflow-hidden rounded-lg border border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-cyan-500 transition-all cursor-pointer p-6 text-left"
            >
              {/* Background gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* Content */}
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-3xl block mb-2">{game.icon}</span>
                    <h3 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors">
                      {game.name}
                    </h3>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors transform group-hover:translate-x-1" />
                </div>
                <p className="text-sm text-slate-400">
                  View members, events, and manage guild operations
                </p>
              </div>
            </button>
          ))}
        </div>

        {SUPPORTED_GAMES.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400">No games configured for this group yet.</p>
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

