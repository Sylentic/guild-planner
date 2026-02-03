import { BottomNav } from '@/components/BottomNav';
import { usePathname } from 'next/navigation';
import { Tab } from './tabs';

interface ClanTabNavProps {
  canManage: boolean;
  initialTab?: Tab;
  gameSlug?: string;
  groupSlug: string;
}

export function ClanTabNav({ canManage, initialTab = 'characters', gameSlug = 'aoc', groupSlug }: ClanTabNavProps) {
  const pathname = usePathname();
  
  // Determine active tab from pathname
  const getActiveTabFromPath = (): Tab => {
    if (pathname.includes('/characters')) return 'characters';
    if (pathname.includes('/events')) return 'events';
    if (pathname.includes('/parties')) return 'parties';
    if (pathname.includes('/matrix')) return 'matrix';
    if (pathname.includes('/manage') || pathname.includes('/settings')) return 'manage';
    if (pathname.includes('/siege')) return 'siege';
    if (pathname.includes('/economy')) return 'economy';
    if (pathname.includes('/ships') || pathname.includes('/fleet')) return 'matrix'; // Reuse matrix slot for ships
    if (pathname.includes('/more') || pathname.includes('/builds') || pathname.includes('/achievements') || pathname.includes('/alliances')) return 'more';
    return initialTab;
  };

  const activeTab = getActiveTabFromPath();

  return (
    <BottomNav
      activeTab={activeTab}
      canManage={canManage}
      gameSlug={gameSlug}
      groupSlug={groupSlug}
    />
  );
}

