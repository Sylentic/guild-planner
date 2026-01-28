'use client';

import { useState, useEffect } from 'react';
import { Trophy, Handshake, Hammer, Swords, Castle } from 'lucide-react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { CharacterWithProfessions } from '@/lib/types';
import { PartiesList } from './PartiesList';
import { AchievementsView } from './AchievementsView';
import { AchievementAdminPanel } from './AchievementAdminPanel';
import { AllianceView } from './AllianceView';
import { BuildLibrary } from './BuildLibrary';
import { SiegeTabContent } from './SiegeTabContent';
import { useParties } from '@/hooks/useParties';
import { useAchievements } from '@/hooks/useAchievements';
import { useAlliances } from '@/hooks/useAlliances';
import { useBuilds } from '@/hooks/useBuilds';

type MoreSubTab = 'parties' | 'siege' | 'achievements' | 'builds' | 'alliances';

interface MoreTabContentProps {
  clanId: string;
  userId: string;
  characters: CharacterWithProfessions[];
  isOfficer: boolean;
}

export function MoreTabContent({ clanId, userId, characters, isOfficer }: MoreTabContentProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Initialize from URL query parameter
  const initialSubTab = (() => {
    const subTabParam = searchParams.get('subTab');
    if (subTabParam && ['parties', 'siege', 'achievements', 'builds', 'alliances'].includes(subTabParam)) {
      return subTabParam as MoreSubTab;
    }
    return 'parties';
  })();

  const [subTab, setSubTab] = useState<MoreSubTab>(initialSubTab);

  // Update URL when sub-tab changes
  const handleSubTabChange = (newSubTab: MoreSubTab) => {
    setSubTab(newSubTab);
    const params = new URLSearchParams(searchParams.toString());
    params.set('subTab', newSubTab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Sync state with URL parameter changes
  useEffect(() => {
    const subTabParam = searchParams.get('subTab');
    if (subTabParam && ['parties', 'siege', 'achievements', 'builds', 'alliances'].includes(subTabParam)) {
      setSubTab(subTabParam as MoreSubTab);
    }
  }, [searchParams]);

  const {
    parties,
    createParty,
    updateParty,
    deleteParty,
    assignCharacter,
    removeFromRoster,
    toggleConfirmed,
  } = useParties(clanId, characters);

  const {
    achievements,
    unlockedCount,
    totalPoints,
    loading: achievementsLoading,
    refresh: refreshAchievements,
  } = useAchievements(clanId);

  const {
    myAlliance,
    loading: alliancesLoading,
    createAlliance,
    inviteGuild,
    leaveAlliance,
  } = useAlliances(clanId);

  const {
    builds,
    loading: buildsLoading,
    createBuild,
    likeBuild,
    copyBuild,
  } = useBuilds(clanId!);

  const SUB_TABS = [
    { id: 'parties', icon: Swords, label: t('nav.parties') },
    { id: 'siege', icon: Castle, label: t('nav.siege') },
    { id: 'achievements', icon: Trophy, label: t('achievements.title') },
    { id: 'builds', icon: Hammer, label: t('builds.title') },
    { id: 'alliances', icon: Handshake, label: t('alliance.title') },
  ] as const;

  return (
    <div className="space-y-4">
      {/* Sub-navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {SUB_TABS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => handleSubTabChange(id as MoreSubTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              subTab === id
                ? 'bg-purple-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {subTab === 'parties' && (
        <PartiesList
          parties={parties}
          characters={characters}
          clanId={clanId}
          userId={userId}
          canManage={isOfficer}
          onCreateParty={createParty}
          onUpdateParty={updateParty}
          onDeleteParty={deleteParty}
          onAssignCharacter={assignCharacter}
          onRemoveFromRoster={removeFromRoster}
          onToggleConfirmed={toggleConfirmed}
        />
      )}

      {subTab === 'siege' && (
        <SiegeTabContent
          clanId={clanId}
          characters={characters}
          isOfficer={isOfficer}
        />
      )}

      {subTab === 'achievements' && (
        achievementsLoading ? (
          <div className="text-center py-8 text-slate-400">{t('common.loading')}</div>
        ) : (
          <div className="space-y-4">
            {isOfficer && (
              <AchievementAdminPanel
                achievements={achievements}
                clanId={clanId}
                onRefresh={refreshAchievements}
              />
            )}
            <AchievementsView
              achievements={achievements}
              unlockedCount={unlockedCount}
              totalPoints={totalPoints}
            />
          </div>
        )
      )}

      {subTab === 'builds' && (
        buildsLoading ? (
          <div className="text-center py-8 text-slate-400">{t('common.loading')}</div>
        ) : (
          <BuildLibrary
            builds={builds}
            onCreateBuild={createBuild}
            onLike={likeBuild}
            onCopy={copyBuild}
          />
        )
      )}

      {subTab === 'alliances' && (
        alliancesLoading ? (
          <div className="text-center py-8 text-slate-400">{t('common.loading')}</div>
        ) : (
          <AllianceView
            alliance={myAlliance}
            clanId={clanId}
            onCreateAlliance={isOfficer ? createAlliance : undefined}
            onInviteGuild={isOfficer ? inviteGuild : undefined}
            onLeave={leaveAlliance}
            isOfficer={isOfficer}
          />
        )
      )}
    </div>
  );
}
