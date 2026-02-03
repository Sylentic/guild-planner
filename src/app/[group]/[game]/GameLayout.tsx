'use client';

import { use, ReactNode } from 'react';
import { Tab } from '@/components/tabs';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAuthContext } from '@/components/AuthProvider';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGroupData } from '@/hooks/useGroupData';
import { useGroupMembership } from '@/hooks/useGroupMembership';
import { ClanLoadingScreen } from '@/components/ClanLoadingScreen';
import { ClanErrorScreen } from '@/components/ClanErrorScreen';
import { ClanLoginScreen } from '@/components/ClanLoginScreen';
import { ClanHeader } from './ClanHeader';
import { ClanTabNav } from '@/components/ClanTabNav';
import { InlineFooter } from '@/components/Footer';
import { Users, Clock, UserPlus, Loader2 } from 'lucide-react';

interface GameLayoutProps {
  params: Promise<{ group: string; game: string }>;
  children: ReactNode;
  activeTab: Tab;
}

export function GameLayout({ params, children, activeTab }: GameLayoutProps) {
  const { group: groupSlug, game: gameSlug } = use(params);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, profile, loading: authLoading, signIn, signOut } = useAuthContext();
  const { t } = useLanguage();

  const {
    group,
    loading: groupLoading,
    error: groupError,
  } = useGroupData(groupSlug);

  const {
    membership,
    loading: membershipLoading,
    apply,
  } = useGroupMembership(group?.id || null, user?.id || null);

  const displayName = profile?.display_name || user?.email || 'User';
  const guildIconUrl = group?.group_icon_url || undefined;

  if (authLoading || groupLoading || membershipLoading) {
    return <ClanLoadingScreen />;
  }

  if (!user) {
    const redirectPath = `${pathname || `/${groupSlug}/${gameSlug}`}${searchParams?.toString() ? `?${searchParams.toString()}` : ''}`;
    return (
      <ClanLoginScreen
        title={t('group.loginRequired')}
        message={t('group.signInToAccess', { name: groupSlug })}
        onSignIn={() => {
          localStorage.setItem('authRedirectTo', redirectPath);
          signIn();
        }}
        signInLabel={t('common.continueWithDiscord')}
        homeLabel={t('common.returnHome')}
      />
    );
  }

  if (!membership) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <Users className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">{t('group.joinClan')}</h2>
          <p className="text-slate-400 mb-6">
            {t('group.applyDescription', { name: group?.name || groupSlug })}
          </p>
          <button
            onClick={apply}
            className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition-colors cursor-pointer"
          >
            <UserPlus className="w-5 h-5" />
            {t('group.applyToJoin')}
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

  if (membership.role === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <Clock className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">{t('group.applicationPending')}</h2>
          <p className="text-slate-400 mb-6">
            {t('group.pendingApproval', { name: group?.name || groupSlug })}
          </p>
          <div className="bg-slate-800/50 rounded-lg p-4 text-sm text-slate-400">
            {t('group.accessAfterApproval')}
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

  if (groupError) {
    return (
      <ClanErrorScreen 
        title={t('group.errorLoading')}
        message={t('group.connectionErrorMessage')}
        error={groupError}
        retryLabel={t('common.retryConnection')}
        onRetry={() => window.location.reload()}
        homeLabel={t('common.returnHome')}
      />
    );
  }

  const enabledGames = [{ slug: gameSlug, name: gameSlug === 'aoc' ? 'Ashes of Creation' : 'Star Citizen', icon: gameSlug === 'aoc' ? '⚔️' : '🚀' }];

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <ClanHeader
        clanName={group?.name || ''}
        groupSlug={groupSlug}
        gameSlug={gameSlug}
        enabledGames={enabledGames}
        characterCount={0}
        role={membership.role || ''}
        displayName={displayName}
        onSignOut={signOut}
        guildIconUrl={guildIconUrl}
      />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 py-6 pb-4">
          {children}
        </div>
      </main>

      <div className="shrink-0">
        <ClanTabNav
          canManage={membership.role === 'admin' || membership.role === 'officer'}
          initialTab={activeTab}
          gameSlug={gameSlug}
          groupSlug={groupSlug}
        />
        <InlineFooter variant="matching" />
      </div>
    </div>
  );
}
