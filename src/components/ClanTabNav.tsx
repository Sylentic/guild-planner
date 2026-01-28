import { BottomNav } from '@/components/BottomNav';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Tab, TAB_LIST } from './tabs';

interface ClanTabNavProps {
  canManage: boolean;
  onTabChange?: (tab: Tab) => void;
  initialTab?: Tab;
}

export function ClanTabNav({ canManage, onTabChange, initialTab = 'characters' }: ClanTabNavProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  // Sync with URL
  useEffect(() => {
    const tabParam = searchParams?.get('tab');
    if (tabParam && (TAB_LIST as readonly string[]).includes(tabParam)) {
      setActiveTab(tabParam as Tab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    params.set('tab', tab);
    if (tab !== 'more' && params.has('subTab')) {
      params.delete('subTab');
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    if (onTabChange) onTabChange(tab);
  };

  return (
    <BottomNav
      activeTab={activeTab}
      onTabChange={handleTabChange}
      canManage={canManage}
    />
  );
}
