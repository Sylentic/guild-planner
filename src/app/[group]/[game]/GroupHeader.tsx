import Link from 'next/link';
import { Home, Settings, LogOut, Archive } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { GameIcon } from '@/components/common/GameIcon';

// Map pages that only exist in specific games to their equivalents in other games
const pageEquivalencyMap: Record<string, Record<string, string>> = {
  'starcitizen': {
    'matrix': 'matrix',      // Both games have matrix
    'fleet': 'matrix',       // AoC doesn't have fleet, use matrix
    'ships': 'matrix',       // AoC doesn't have ships, use matrix
  },
  'aoc': {
    'matrix': 'matrix',      // Both games have matrix
    'fleet': 'fleet',        // AoC doesn't have fleet, go back to characters
    'ships': 'characters',   // AoC doesn't have ships, go to characters
  },
  'ror': {
    'matrix': 'characters',  // RoR doesn't have matrix, go to characters
    'fleet': 'characters',   // RoR doesn't have fleet, go to characters
    'ships': 'characters',   // RoR doesn't have ships, go to characters
  },
};

function getPageForGame(currentPath: string, targetGame: string): string {
  // Extract the page segment from the current path
  // Path format: /groupSlug/gameSlug/page
  const pathSegments = currentPath.split('/').filter(Boolean);
  const currentPage = pathSegments[2] || 'characters';
  
  // Get the equivalent page for the target game, default to characters
  const equivalentPage = pageEquivalencyMap[targetGame]?.[currentPage] || 'characters';
  return equivalentPage;
}

interface GroupHeaderProps {
  clanName: string;
  groupSlug: string;
  gameSlug: string;
  enabledGames: Array<{ slug: string; name: string; icon: string; iconUrl?: string; archived: boolean }>;
  characterCount: number;
  role: string;
  displayName: string;
  onSignOut: () => void;
  guildIconUrl?: string;
}

export function GroupHeader({
  clanName,
  groupSlug,
  gameSlug,
  enabledGames,
  characterCount,
  role,
  displayName,
  onSignOut,
  guildIconUrl,
}: GroupHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const handleGameSwitch = (targetGameSlug: string) => {
    const equivalentPage = getPageForGame(pathname || '', targetGameSlug);
    router.push(`/${groupSlug}/${targetGameSlug}/${equivalentPage}`);
  };
  
  return (
    <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-800 shrink-0 z-50">
      <div className="max-w-7xl mx-auto px-3 md:px-4 py-2 md:py-4">
        <div className="flex items-center justify-between">
          {/* Left: Navigation */}
          <div className="flex items-center gap-2 md:gap-4">
            <Link
              href="/"
              className="p-1.5 md:p-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Home"
            >
              <Home className="w-5 h-5 md:w-5 md:h-5" />
            </Link>
            {guildIconUrl && (
              <img src={guildIconUrl} alt="Group Icon" className="w-10 h-10 rounded-full border border-slate-700 bg-slate-800" />
            )}
            <Link
              href={`/${groupSlug}`}
              className="hover:opacity-80 transition-opacity cursor-pointer"
              title="Return to game selection"
            >
              <div>
                <h1 className="font-display text-base md:text-xl font-semibold text-white hover:text-cyan-400">
                  {clanName || groupSlug}
                </h1>
                <p className="text-slate-500 text-xs md:text-sm hidden sm:block">
                  {characterCount} characters •
                  <span className={`ml-1 ${
                    role === 'admin' ? 'text-orange-400' :
                    role === 'officer' ? 'text-purple-400' :
                    'text-cyan-400'
                  }`}>
                    {role}
                  </span>
                </p>
              </div>
            </Link>

            {/* Game Switcher */}
            {enabledGames.length > 1 && (
              <div className="hidden sm:flex items-center gap-2 ml-4 pl-4 border-l border-slate-700">
                {enabledGames.map((game) => (
                  <button
                    key={game.slug}
                    onClick={() => handleGameSwitch(game.slug)}
                    className={`relative px-2 py-1 rounded text-sm transition-colors flex items-center gap-1.5 ${
                      gameSlug === game.slug
                        ? 'bg-slate-700 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    } ${game.archived ? 'opacity-60' : ''}`}
                    title={game.archived ? `${game.name} (Archived)` : game.name}
                  >
                    <GameIcon 
                      icon={game.icon}
                      iconUrl={game.iconUrl}
                      alt={game.name}
                      size={32}
                    />
                    <span className="hidden md:inline">{game.name}</span>
                    {game.archived && (
                      <Archive className="inline-block w-3 h-3 ml-1 text-orange-400" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: User info */}
          <div className="flex items-center gap-1 md:gap-3">
            <span className="text-slate-300 text-sm hidden sm:inline">{displayName}</span>
            <Link
              href="/settings"
              className="p-1.5 md:p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Settings"
            >
              <Settings className="w-4 h-4 md:w-[18px] md:h-[18px]" />
            </Link>
            <button
              onClick={onSignOut}
              className="p-1.5 md:p-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Sign out"
            >
              <LogOut className="w-4 h-4 md:w-[18px] md:h-[18px]" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

