import Link from 'next/link';
import { Home, Settings, LogOut } from 'lucide-react';

interface ClanHeaderProps {
  clanName: string;
  clanSlug: string;
  characterCount: number;
  role: string;
  displayName: string;
  onSignOut: () => void;
  guildIconUrl?: string;
}

export function ClanHeader({
  clanName,
  clanSlug,
  characterCount,
  role,
  displayName,
  onSignOut,
  guildIconUrl,
}: ClanHeaderProps) {
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
              <img src={guildIconUrl} alt="Guild Icon" className="w-10 h-10 rounded-full border border-slate-700 bg-slate-800" />
            )}
            <div>
              <h1 className="font-display text-base md:text-xl font-semibold text-white">
                {clanName || clanSlug}
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
