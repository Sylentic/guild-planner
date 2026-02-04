
"use client";
import { AchievementsTab } from './tabs/AchievementsTab';
import { GroupHeader } from './GroupHeader';
import { ManageTab } from './tabs/ManageTab';
import { GuildIconUploaderWrapper } from './GuildIconUploaderWrapper';
import { BuildsTab } from './tabs/BuildsTab';
import { AlliancesTab } from './tabs/AlliancesTab';

import { useState, use, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Users, Home, Loader2, AlertCircle, LogOut, Shield, Clock, UserPlus, Settings, Swords } from 'lucide-react';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGroupData } from '@/hooks/useGroupData';
import { useGroupMembership } from '@/hooks/useGroupMembership';
import { useEvents } from '@/hooks/useEvents';
import { CharactersTab } from './tabs/CharactersTab';
import { PartiesTab } from './tabs/PartiesTab';
import { CharacterEditModal } from './CharacterEditModal';
import { EventsList } from '@/components/views/EventsList';
import { CharacterFiltersBar, CharacterFilters, DEFAULT_FILTERS, filterCharacters } from '@/components/characters/CharacterFilters';
import { ClanSettings } from '@/components/settings/ClanSettings';
import { RecruitmentSettings } from '@/components/settings/RecruitmentSettings';
import { PermissionsSettings } from '@/components/settings/PermissionsSettings';
import { ClanTabNav } from '@/components/layout/ClanTabNav';
import { Tab } from '@/components/common/tabs';
import { InlineFooter } from '@/components/layout/Footer';
import { ROLE_CONFIG, GroupRole } from '@/lib/permissions';
import { ClanMatrix } from '@/components/views/ClanMatrix';
import { ShipsView } from '@/components/views/ShipsView';
import { SiegeTab } from './tabs/SiegeTab';
import { EconomyTab } from './tabs/EconomyTab';
import { MoreTabContent } from '@/components/views/MoreTabContent';
import { createGroup, getGroupBySlug } from '@/lib/auth';
import { CharacterWithProfessions } from '@/lib/types';
import { ClanLoadingScreen } from '@/components/screens/ClanLoadingScreen';
import { ClanErrorScreen } from '@/components/screens/ClanErrorScreen';
import { ClanLoginScreen } from '@/components/screens/ClanLoginScreen';
import { ClanCreateScreen } from '@/components/screens/ClanCreateScreen';
import { getGroupGames } from '@/lib/group-games';

// Tab type now imported from ClanTabNav

export default function GameGroupPage({ params }: { params: Promise<{ group: string; game: string }> }) {
  const { group: groupSlug, game: gameSlug } = use(params);
  const router = useRouter();
  
  // Redirect to /characters as the default view
  useEffect(() => {
    router.replace(`/${groupSlug}/${gameSlug}/characters`);
  }, [groupSlug, gameSlug, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
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


