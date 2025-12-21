'use client';

import { useState } from 'react';
import { Warehouse, Home, Truck, Coins } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGuildBank } from '@/hooks/useGuildBank';
import { useFreeholds } from '@/hooks/useFreeholds';
import { useCaravans } from '@/hooks/useCaravans';
import { GuildBankView } from './GuildBankView';
import { FreeholdDirectoryView } from './FreeholdDirectoryView';
import { CaravanListView } from './CaravanListView';

type EconomySubTab = 'bank' | 'freeholds' | 'caravans';

interface EconomyTabContentProps {
  clanId: string;
  isOfficer: boolean;
}

export function EconomyTabContent({ clanId, isOfficer }: EconomyTabContentProps) {
  const { t } = useLanguage();
  const [subTab, setSubTab] = useState<EconomySubTab>('bank');

  const {
    bank,
    inventory,
    transactions,
    loading: bankLoading,
    initializeBank,
  } = useGuildBank(clanId);

  const {
    freeholds,
    loading: freeholdsLoading,
    createFreehold,
    addBuilding,
  } = useFreeholds(clanId);

  const {
    upcomingCaravans,
    loading: caravansLoading,
    createCaravan,
    signUpAsEscort,
    withdrawEscort,
  } = useCaravans(clanId);

  const SUB_TABS = [
    { id: 'bank', icon: Warehouse, label: t('bank.title') },
    { id: 'freeholds', icon: Home, label: t('freehold.title') },
    { id: 'caravans', icon: Truck, label: t('caravan.title') },
  ] as const;

  return (
    <div className="space-y-4">
      {/* Sub-navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {SUB_TABS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setSubTab(id as EconomySubTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              subTab === id
                ? 'bg-amber-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {subTab === 'bank' && (
        bankLoading ? (
          <div className="text-center py-8 text-slate-400">{t('common.loading')}</div>
        ) : bank ? (
          <GuildBankView
            bank={bank}
            inventory={inventory}
            transactions={transactions}
            isOfficer={isOfficer}
          />
        ) : (
          <div className="bg-slate-800/50 rounded-xl p-8 text-center">
            <Coins className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-300 mb-2">
              {t('bank.emptyInventory')}
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              {t('bank.emptyInventoryDesc')}
            </p>
            {isOfficer && (
              <button
                onClick={() => initializeBank()}
                className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
              >
                {t('bank.title')}
              </button>
            )}
          </div>
        )
      )}

      {subTab === 'freeholds' && (
        freeholdsLoading ? (
          <div className="text-center py-8 text-slate-400">{t('common.loading')}</div>
        ) : (
          <FreeholdDirectoryView
            freeholds={freeholds}
            onAddFreehold={createFreehold}
            onAddBuilding={addBuilding}
          />
        )
      )}

      {subTab === 'caravans' && (
        caravansLoading ? (
          <div className="text-center py-8 text-slate-400">{t('common.loading')}</div>
        ) : (
          <CaravanListView
            caravans={upcomingCaravans}
            onCreateCaravan={isOfficer ? createCaravan : undefined}
            onSignUp={signUpAsEscort}
            onWithdraw={withdrawEscort}
            isOfficer={isOfficer}
          />
        )
      )}
    </div>
  );
}
