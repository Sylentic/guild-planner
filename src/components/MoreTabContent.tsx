'use client';

import { useState } from 'react';
import { Trophy, Handshake, Hammer, Grid3X3, Swords } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { CharacterWithProfessions } from '@/lib/types';
import { ClanMatrix } from './ClanMatrix';
import { PartiesList } from './PartiesList';
import { AchievementsView } from './AchievementsView';
import { AllianceView } from './AllianceView';
import { BuildLibrary } from './BuildLibrary';
import { useParties } from '@/hooks/useParties';
import { useAchievements } from '@/hooks/useAchievements';
import { useAlliances } from '@/hooks/useAlliances';
import { useBuilds } from '@/hooks/useBuilds';

type MoreSubTab = 'parties' | 'matrix' | 'achievements' | 'builds' | 'alliances';

interface MoreTabContentProps {
  clanId: string;
  userId: string;
  characters: CharacterWithProfessions[];
  isOfficer: boolean;
}

export function MoreTabContent({ clanId, userId, characters, isOfficer }: MoreTabContentProps) {
  const { t } = useLanguage();
  const [subTab, setSubTab] = useState<MoreSubTab>('parties');

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
    { id: 'matrix', icon: Grid3X3, label: t('nav.matrix') },
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
            onClick={() => setSubTab(id as MoreSubTab)}
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

      {subTab === 'matrix' && (
        <ClanMatrix members={characters} />
      )}

      {subTab === 'achievements' && (
        achievementsLoading ? (
          <div className="text-center py-8 text-slate-400">{t('common.loading')}</div>
        ) : (
          <AchievementsView
            achievements={achievements}
            unlockedCount={unlockedCount}
            totalPoints={totalPoints}
          />
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
