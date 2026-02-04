import { Users, Zap, Gamepad2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function LandingHero() {
  const { t } = useLanguage();
  return (
    <div className="text-center max-w-4xl mx-auto px-4">
      <div className="inline-block mb-8 px-4 py-2 bg-blue-500/20 border border-blue-500/50 rounded-lg">
        <span className="text-blue-400 font-semibold text-sm">✨ Multi-Game Guild Management Platform</span>
      </div>
      
      <h1 className="font-display text-5xl sm:text-6xl font-bold mb-8 leading-tight">
        <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Organize Any Game
        </span>
      </h1>
      
      <p className="text-lg text-slate-300 mb-12 max-w-2xl mx-auto">
        Manage your guild, coordinate your team, and track everything — supporting multiple games with powerful organization tools.
      </p>

      {/* Game Icons */}
      <div className="flex items-center justify-center gap-12 mb-16 flex-wrap">
        <div className="flex flex-col items-center gap-3">
          <div className="text-5xl">⚔️</div>
          <span className="text-sm text-slate-400 font-medium">MMO RPGs</span>
        </div>
        <div className="text-slate-700">|</div>
        <div className="flex flex-col items-center gap-3">
          <div className="text-5xl">🚀</div>
          <span className="text-sm text-slate-400 font-medium">Space Games</span>
        </div>
        <div className="text-slate-700">|</div>
        <div className="flex flex-col items-center gap-3">
          <Gamepad2 className="w-12 h-12 text-slate-500" />
          <span className="text-sm text-slate-400 font-medium">More Games</span>
        </div>
      </div>

      {/* Feature Pills */}
      <div className="flex flex-wrap justify-center gap-4 mb-12">
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/60 rounded-full border border-slate-700 hover:border-slate-600 transition">
          <Users className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-slate-300">Guild Management</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/60 rounded-full border border-slate-700 hover:border-slate-600 transition">
          <Zap className="w-4 h-4 text-yellow-400" />
          <span className="text-sm text-slate-300">Real-time Updates</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/60 rounded-full border border-slate-700 hover:border-slate-600 transition">
          <span className="text-lg">📊</span>
          <span className="text-sm text-slate-300">Analytics</span>
        </div>
      </div>
    </div>
  );
}

