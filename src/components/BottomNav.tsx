'use client';

import { Users, Grid3X3, Calendar, Swords, Settings } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

type Tab = 'characters' | 'events' | 'parties' | 'matrix' | 'manage';

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  canManage: boolean;
}

export function BottomNav({ activeTab, onTabChange, canManage }: BottomNavProps) {
  const { t } = useLanguage();
  
  const NAV_ITEMS: { tab: Tab; icon: React.ElementType; labelKey: string; requiresManage?: boolean }[] = [
    { tab: 'characters', icon: Users, labelKey: 'nav.characters' },
    { tab: 'events', icon: Calendar, labelKey: 'nav.events' },
    { tab: 'parties', icon: Swords, labelKey: 'nav.parties' },
    { tab: 'matrix', icon: Grid3X3, labelKey: 'nav.matrix' },
    { tab: 'manage', icon: Settings, labelKey: 'nav.manage', requiresManage: true },
  ];

  const visibleItems = NAV_ITEMS.filter(item => !item.requiresManage || canManage);

  return (
    <nav 
      className="z-50"
      style={{ 
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        background: 'rgba(15, 23, 42, 0.98)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(71, 85, 105, 0.5)',
      }}
    >
      <div className="flex items-stretch" style={{ height: '64px' }}>
        {visibleItems.map(({ tab, icon: Icon, labelKey }) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className="relative flex-1 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-200"
              style={{
                color: isActive ? '#fb923c' : '#94a3b8',
                background: isActive ? 'rgba(251, 146, 60, 0.1)' : 'transparent',
              }}
            >
              {/* Active indicator bar - positioned at top of this button */}
              {isActive && (
                <span 
                  className="absolute top-0 w-10 h-0.5 rounded-full bg-orange-400"
                  style={{ left: '50%', transform: 'translateX(-50%)' }}
                />
              )}
              
              <Icon 
                size={24} 
                strokeWidth={isActive ? 2.5 : 1.8}
                style={{
                  filter: isActive ? 'drop-shadow(0 0 4px rgba(251, 146, 60, 0.4))' : 'none',
                }}
              />
              <span 
                className="font-medium"
                style={{ 
                  fontSize: '10px',
                  letterSpacing: '0.02em',
                  opacity: isActive ? 1 : 0.8,
                }}
              >
                {t(labelKey)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
