import Link from 'next/link';
import Image from 'next/image';
import { Home, Settings, LogOut } from 'lucide-react';

interface GroupHeaderProps {
  clanName: string;
  groupSlug: string;
  characterCount: number;
  role: string;
  displayName: string;
  onSignOut: () => void;
  guildIconUrl?: string;
}

export function GroupHeader({
  clanName,
  groupSlug,
  characterCount,
  role,
  displayName,
  onSignOut,
  guildIconUrl,
}: GroupHeaderProps) {
  return (
    <header className="bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50 shrink-0 z-50 sticky top-0">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4">
        <div className="flex items-center justify-between">
          {/* Left: Navigation */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            <Link
              href="/"
              className="p-1.5 sm:p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg sm:rounded-xl transition-all cursor-pointer"
              title="Home"
            >
              <Home className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
            {guildIconUrl && (
              <Image src={guildIconUrl} alt="Group Icon" width={40} height={40} className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl border border-slate-700/50 bg-slate-800 ring-2 ring-slate-700/30" />
            )}
            <Link
              href="/"
              className="hover:opacity-80 transition-opacity cursor-pointer"
              title="Return to game selection"
            >
              <div>
                <h1 className="font-display text-sm sm:text-base md:text-xl font-semibold text-white hover:text-indigo-300 transition-colors">
                  {clanName || groupSlug}
                </h1>
                <p className="text-slate-500 text-[10px] sm:text-xs md:text-sm hidden sm:block">
                  {characterCount} characters •
                  <span className={`ml-1 ${
                    role === 'admin' ? 'text-amber-400' :
                    role === 'officer' ? 'text-purple-400' :
                    'text-indigo-400'
                  }`}>
                    {role}
                </span>
              </p>
              </div>
            </Link>
          </div>

          {/* Right: User info */}
          <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
            <span className="text-slate-300 text-xs sm:text-sm hidden sm:inline">{displayName}</span>
            <Link
              href="/settings"
              className="p-1.5 sm:p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg sm:rounded-xl transition-all cursor-pointer"
              title="Settings"
            >
              <Settings className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            </Link>
            <button
              onClick={onSignOut}
              className="p-1.5 sm:p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg sm:rounded-xl transition-all cursor-pointer"
              title="Sign out"
            >
              <LogOut className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

