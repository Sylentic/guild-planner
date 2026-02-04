'use client';

import { useState, useEffect } from 'react';
import { Trophy, Handshake, Hammer, Swords, Castle, Rocket } from 'lucide-react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { CharacterWithProfessions } from '@/lib/types';
import { getGame } from '@/lib/games';
import { PartiesList } from './PartiesList';
import { AchievementsView } from './AchievementsView';
import { AchievementAdminPanel } from './AchievementAdminPanel';
import { AllianceView } from './AllianceView';
import { BuildLibrary } from './BuildLibrary';
import { SiegeTabContent } from './SiegeTabContent';
import { ShipsView } from './ShipsView';
import { useParties } from '@/hooks/useParties';
import { useAchievements } from '@/hooks/useAchievements';
import { useAlliances } from '@/hooks/useAlliances';
import { useBuilds } from '@/hooks/useBuilds';

type MoreSubTab = 'parties' | 'siege' | 'achievements' | 'builds' | 'alliances' | 'ships';

interface MoreTabContentProps {
  groupId: string;
  userId: string;
  characters: CharacterWithProfessions[];
  isOfficer: boolean;
  gameSlug?: string;
}

export function MoreTabContent({ groupId, userId, characters, isOfficer, gameSlug = 'aoc' }: MoreTabContentProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Get game features dynamically
  let gameFeatures = { parties: true, siege: true, achievements: true, builds: true, alliances: true, ships: false };
  try {
    const game = getGame(gameSlug as any);
    gameFeatures = game.features as any;
  } catch (e) {
    // Fallback to defaults if game not found
  }

  // Filter sub-tabs based on game features
  const allowedSubTabs: MoreSubTab[] = [];
  if (gameFeatures.parties) allowedSubTabs.push('parties');
  if (gameFeatures.siege) allowedSubTabs.push('siege');
  if (gameFeatures.achievements) allowedSubTabs.push('achievements');
  if (gameFeatures.builds) allowedSubTabs.push('builds');
  if (gameFeatures.alliances) allowedSubTabs.push('alliances');
  if (gameFeatures.ships) allowedSubTabs.push('ships');

  // Always initialize with default available subtab for the game
  const defaultSubTab: MoreSubTab = allowedSubTabs.length > 0 ? allowedSubTabs[0] : 'parties';
  const [subTab, setSubTab] = useState<MoreSubTab>(defaultSubTab);

  // Sync state with URL parameter on mount and when searchParams changes
  useEffect(() => {
    const subTabParam = searchParams?.get('subTab');
    if (subTabParam && allowedSubTabs.includes(subTabParam as MoreSubTab)) {
      setSubTab(subTabParam as MoreSubTab);
    } else {
      setSubTab(defaultSubTab);
    }
  }, [searchParams, gameSlug]);

  // Update URL when sub-tab changes
  const handleSubTabChange = (newSubTab: MoreSubTab) => {
    setSubTab(newSubTab);
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('subTab', newSubTab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const {
    parties,
    createParty,
    updateParty,
    deleteParty,
    assignCharacter,
    removeFromRoster,
    toggleConfirmed,
  } = useParties(groupId, characters);

  const {
    achievements,
    unlockedCount,
    totalPoints,
    loading: achievementsLoading,
    refresh: refreshAchievements,
  } = useAchievements(groupId);

  const {
    myAlliance,
    loading: alliancesLoading,
    createAlliance,
    inviteGuild,
    leaveAlliance,
  } = useAlliances(groupId);

  // Only load builds for games that support it
  const {
    builds,
    loading: buildsLoading,
    createBuild,
    likeBuild,
    copyBuild,
  } = useBuilds(gameFeatures.builds ? groupId : null);

  // Define all possible tabs with their configurations
  const ALL_SUB_TABS = [
    { id: 'parties' as const, icon: Swords, label: t('nav.parties') },
    { id: 'siege' as const, icon: Castle, label: t('nav.siege') },
    { id: 'achievements' as const, icon: Trophy, label: t('achievements.title') },
    { id: 'builds' as const, icon: Hammer, label: t('builds.title') },
    { id: 'alliances' as const, icon: Handshake, label: t('alliance.title') },
    { id: 'ships' as const, icon: Rocket, label: t('ships.overview') },
  ];

  // Filter tabs dynamically based on game features
  const SUB_TABS = ALL_SUB_TABS.filter(tab => {
    switch (tab.id) {
      case 'parties': return gameFeatures.parties;
      case 'siege': return gameFeatures.siege;
      case 'achievements': return gameFeatures.achievements;
      case 'builds': return gameFeatures.builds;
      case 'alliances': return gameFeatures.alliances;
      case 'ships': return gameFeatures.ships;
      default: return false;
    }
  });



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
          groupId={groupId}
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
          groupId={groupId}
          characters={characters}
          userId={userId}
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
                groupId={groupId}
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
            groupId={groupId}
            onCreateAlliance={isOfficer ? createAlliance : undefined}
            onInviteGuild={isOfficer ? inviteGuild : undefined}
            onLeave={leaveAlliance}
            isOfficer={isOfficer}
          />
        )
      )}

      {subTab === 'ships' && (
        <ShipsView
          characters={[]}
          userId={userId}
          canManage={isOfficer}
          groupId={groupId}
          gameSlug={gameSlug}
        />
      )}
    </div>
  );
}

