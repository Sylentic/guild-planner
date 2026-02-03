"use client";
import Link from 'next/link';
import { usePermissions } from '@/hooks/usePermissions';
import { Skeleton } from './ui/Skeleton';
import { useState } from 'react';

import { Users, Calendar, Grid3X3, Settings, Warehouse, MoreHorizontal, Sword, Trophy, BookOpen, Handshake, Hammer, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

import { Tab, GAME_TAB_EXCLUSIONS } from './tabs';

interface BottomNavProps {
  activeTab: Tab;
  canManage: boolean;
  gameSlug?: string;
  groupSlug: string;
}

// Sub-menu items for "More" grouping
const MORE_ITEMS: { tab: Tab; icon: React.ElementType; labelKey: string }[] = [
  { tab: 'parties', icon: Users, labelKey: 'nav.parties' },
  { tab: 'siege', icon: Sword, labelKey: 'nav.siege' },
  { tab: 'achievements', icon: Trophy, labelKey: 'nav.achievements' },
  { tab: 'alliances', icon: Handshake, labelKey: 'nav.alliances' },
  { tab: 'builds', icon: Hammer, labelKey: 'nav.builds' },
  { tab: 'economy', icon: TrendingUp, labelKey: 'nav.economy' },
];

export function BottomNav({ activeTab, canManage, gameSlug = 'aoc', groupSlug }: BottomNavProps) {
  const { t } = useLanguage();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  
  const getTabPath = (tab: Tab): string => {
    const basePath = `/${groupSlug}/${gameSlug}`;
    switch (tab) {
      case 'characters': return `${basePath}/characters`;
      case 'events': return `${basePath}/events`;
      case 'matrix': return gameSlug === 'star-citizen' ? `${basePath}/fleet` : `${basePath}/matrix`;
      case 'parties': return `${basePath}/parties`;
      case 'siege': return `${basePath}/siege`;
      case 'achievements': return `${basePath}/achievements`;
      case 'alliances': return `${basePath}/alliances`;
      case 'builds': return `${basePath}/builds`;
      case 'economy': return `${basePath}/economy`;
      case 'more': return `${basePath}/more`;
      case 'manage': return `${basePath}/settings`;
      default: return `${basePath}/characters`;
    }
  };
  
  const NAV_ITEMS: { tab: Tab; icon: React.ElementType; labelKey: string; requiresManage?: boolean }[] = [
    { tab: 'characters', icon: Users, labelKey: 'nav.characters' },
    { tab: 'events', icon: Calendar, labelKey: 'nav.events' },
    { tab: 'matrix', icon: Grid3X3, labelKey: gameSlug === 'star-citizen' ? 'nav.ships' : 'nav.matrix' },
    { tab: 'manage', icon: Settings, labelKey: 'nav.manage', requiresManage: true },
  ];
  
  const excludedTabs = GAME_TAB_EXCLUSIONS[gameSlug] || [];
  const visibleItems = NAV_ITEMS.filter(item => {
    if (excludedTabs.includes(item.tab)) return false;
    if (item.requiresManage && !canManage) return false;
    return true;
  });

  // Check if any more items are visible (not excluded)
  const visibleMoreItems = MORE_ITEMS.filter(item => !excludedTabs.includes(item.tab));
  const isMoreItemActive = visibleMoreItems.some(item => item.tab === activeTab) || activeTab === 'more';
  
  // Always show More button, but determine if it's a dropdown or direct link
  const hasMoreDropdown = visibleMoreItems.length > 0;
  const showMoreButton = true; // Always show for all games
  
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
            <Link
              key={tab}
              href={getTabPath(tab)}
              className="relative flex-1 flex flex-col items-center justify-center gap-1 transition-all duration-200"
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
            </Link>
          );
        })}

        {/* "More" menu button */}
        {showMoreButton && (
          <div className="relative flex-1">
            {hasMoreDropdown ? (
              <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="relative w-full h-full flex flex-col items-center justify-center gap-1 transition-all duration-200"
              style={{
                color: isMoreItemActive ? '#fb923c' : '#94a3b8',
                background: isMoreItemActive ? 'rgba(251, 146, 60, 0.1)' : 'transparent',
              }}
            >
              {/* Active indicator bar */}
              {isMoreItemActive && (
                <span 
                  className="absolute top-0 w-10 h-0.5 rounded-full bg-orange-400"
                  style={{ left: '50%', transform: 'translateX(-50%)' }}
                />
              )}
              <MoreHorizontal 
                size={24} 
                strokeWidth={isMoreItemActive ? 2.5 : 1.8}
                style={{
                  filter: isMoreItemActive ? 'drop-shadow(0 0 4px rgba(251, 146, 60, 0.4))' : 'none',
                }}
              />
              <span 
                className="font-medium"
                style={{ 
                  fontSize: '10px',
                  letterSpacing: '0.02em',
                  opacity: isMoreItemActive ? 1 : 0.8,
                }}
              >
                {t('nav.more')}
              </span>
            </button>
            ) : (
              <Link
                href={getTabPath('more')}
                className="relative w-full h-full flex flex-col items-center justify-center gap-1 transition-all duration-200"
                style={{
                  color: isMoreItemActive ? '#fb923c' : '#94a3b8',
                  background: isMoreItemActive ? 'rgba(251, 146, 60, 0.1)' : 'transparent',
                }}
              >
                {/* Active indicator bar */}
                {isMoreItemActive && (
                  <span 
                    className="absolute top-0 w-10 h-0.5 rounded-full bg-orange-400"
                    style={{ left: '50%', transform: 'translateX(-50%)' }}
                  />
                )}
                <MoreHorizontal 
                  size={24} 
                  strokeWidth={isMoreItemActive ? 2.5 : 1.8}
                  style={{
                    filter: isMoreItemActive ? 'drop-shadow(0 0 4px rgba(251, 146, 60, 0.4))' : 'none',
                  }}
                />
                <span 
                  className="font-medium"
                  style={{ 
                    fontSize: '10px',
                    letterSpacing: '0.02em',
                    opacity: isMoreItemActive ? 1 : 0.8,
                  }}
                >
                  {t('nav.more')}
                </span>
              </Link>
            )}

            {/* Dropdown menu for more items */}
            {hasMoreDropdown && showMoreMenu && (
              <div 
                className="absolute bottom-full left-0 right-0 mb-2 bg-slate-900 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-50"
              >
                {visibleMoreItems.map(({ tab, icon: Icon, labelKey }) => {
                  const isActive = activeTab === tab;
                  return (
                    <Link
                      key={tab}
                      href={getTabPath(tab)}
                      onClick={() => setShowMoreMenu(false)}
                      className="flex items-center gap-3 px-4 py-3 transition-colors"
                      style={{
                        background: isActive ? 'rgba(251, 146, 60, 0.2)' : 'transparent',
                        color: isActive ? '#fb923c' : '#94a3b8',
                        borderLeft: isActive ? '3px solid #fb923c' : '3px solid transparent',
                      }}
                    >
                      <Icon size={18} />
                      <span className="text-sm font-medium">{t(labelKey)}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

