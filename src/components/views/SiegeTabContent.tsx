'use client';

import { useState } from 'react';
import { Shield, Crosshair, Trophy, Gem, Swords } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePermissions } from '@/hooks/usePermissions';
import { Skeleton } from '@/components/ui/Skeleton';
import { useSiegeEvents, RosterSignupData } from '@/hooks/useSiegeEvents';
import { useLootSystem } from '@/hooks/useLootSystem';
import { useNodeCitizenships } from '@/hooks/useNodeCitizenships';
import { SiegeRosterView } from '@/components/views/SiegeRosterView';
import { SiegeEventForm } from '@/components/forms/SiegeEventForm';
import { DKPLeaderboard } from '@/components/views/DKPLeaderboard';
import { LootHistoryView } from '@/components/views/LootHistoryView';
import { NodeDistributionView } from '@/components/views/NodeDistributionView';
import { CharacterWithProfessions } from '@/lib/types';

type SiegeSubTab = 'roster' | 'nodes' | 'dkp' | 'loot';

interface SiegeTabContentProps {
  groupId: string;
  characters: CharacterWithProfessions[];
  userId?: string;
}

export function SiegeTabContent({ groupId, characters, userId }: SiegeTabContentProps) {
  const { t } = useLanguage();
  const { hasPermission } = usePermissions(groupId);
  const [subTab, setSubTab] = useState<SiegeSubTab>('roster');
  const [showEventForm, setShowEventForm] = useState(false);
  
  const {
    upcomingSieges,
    loading: siegeLoading,
    createSiege,
    signUp,
    withdraw,
  } = useSiegeEvents(groupId);

  const {
    leaderboard,
    lootHistory,
    loading: lootLoading,
    distributeLoot,
  } = useLootSystem(groupId);

  const {
    distribution,
    loading: nodesLoading,
  } = useNodeCitizenships(groupId);

  const SUB_TABS = [
    { id: 'roster', icon: Shield, label: t('siege.roster') },
    { id: 'nodes', icon: Crosshair, label: t('nodes.distribution') },
    { id: 'dkp', icon: Trophy, label: t('loot.leaderboard') },
    { id: 'loot', icon: Gem, label: t('loot.history') },
  ] as const;

  const upcomingEvent = upcomingSieges[0];

  // Adapter functions for component prop compatibility
  const handleSignUp = (role: string, characterId: string) => {
    if (!upcomingEvent) return;
    const data: RosterSignupData = { character_id: characterId, role: role as RosterSignupData['role'] };
    signUp(upcomingEvent.id, data);
  };

  const handleWithdraw = (characterId: string) => {
    if (!upcomingEvent) return;
    withdraw(upcomingEvent.id, characterId);
  };

  const handleDistribute = (lootId: string) => {
    // For now, just mark as distributed without specific character
    distributeLoot(lootId, '', 0);
  };

  // Permission checks
  const { loading } = usePermissions(groupId);
  const canCreateSiege = hasPermission('siege_create_event');
  const canEditRosters = hasPermission('siege_edit_rosters');
  const canDistributeLoot = hasPermission('siege_edit_rosters');

  return (
    <div className="space-y-4">
      {/* Sub-navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {SUB_TABS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setSubTab(id as SiegeSubTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              subTab === id
                ? 'bg-orange-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {subTab === 'roster' && (
        <div className="space-y-4">
          {loading ? (
            <Skeleton className="h-12 w-full" />
          ) : canCreateSiege && (
            <button
              onClick={() => setShowEventForm(true)}
              className="w-full px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
            >
              + {t('siege.createEvent')}
            </button>
          )}

          {siegeLoading ? (
            <div className="text-center py-8 text-slate-400">{t('common.loading')}</div>
          ) : upcomingEvent ? (
            <SiegeRosterView
              siege={upcomingEvent}
              characters={characters}
              onSignUp={handleSignUp}
              onWithdraw={handleWithdraw}
            />
          ) : (
            <div className="bg-slate-800/50 rounded-xl p-8 text-center">
              <Swords className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-slate-300 mb-2">
                {t('siege.noUpcoming')}
              </h3>
              <p className="text-sm text-slate-500">
                {t('siege.noUpcomingDesc')}
              </p>
            </div>
          )}

          {showEventForm && (
            <SiegeEventForm
              onSubmit={async (data) => {
                await createSiege(data);
                setShowEventForm(false);
              }}
              onCancel={() => setShowEventForm(false)}
            />
          )}
        </div>
      )}

      {subTab === 'nodes' && (
        nodesLoading ? (
          <div className="text-center py-8 text-slate-400">{t('common.loading')}</div>
        ) : (
          <NodeDistributionView 
            distribution={distribution} 
            totalMembers={characters.length} 
          />
        )
      )}

      {subTab === 'dkp' && (
        lootLoading ? (
          <div className="text-center py-8 text-slate-400">{t('common.loading')}</div>
        ) : (
          <DKPLeaderboard leaderboard={leaderboard} />
        )
      )}

      {subTab === 'loot' && (
        lootLoading ? (
          <div className="text-center py-8 text-slate-400">{t('common.loading')}</div>
        ) : (
          <LootHistoryView
            history={lootHistory}
            onDistribute={canDistributeLoot ? handleDistribute : undefined}
          />
        )
      )}
    </div>
  );
}

