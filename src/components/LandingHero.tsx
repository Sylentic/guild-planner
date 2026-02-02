import { Users, Zap, Gamepad2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function LandingHero() {
  const { t } = useLanguage();
  return (
    <div className="text-center max-w-3xl mx-auto">
      <div className="inline-block mb-6 px-4 py-2 bg-blue-500/20 border border-blue-500/50 rounded-lg">
        <span className="text-blue-400 font-semibold text-sm">✨ Multi-Game Guild Management Platform</span>
      </div>
      
      <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
        <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Organize Any Game
        </span>
      </h1>
      
      <p className="text-xl text-slate-300 mb-12">
        Manage your guild, coordinate your team, and track everything — whether you're in Ashes of Creation, Star Citizen, or any game you love.
      </p>

      {/* Game Icons */}
      <div className="flex items-center justify-center gap-8 mb-12">
        <div className="flex flex-col items-center gap-2">
          <div className="text-4xl">⚔️</div>
          <span className="text-sm text-slate-400">Ashes of Creation</span>
        </div>
        <div className="text-slate-600">•</div>
        <div className="flex flex-col items-center gap-2">
          <div className="text-4xl">🚀</div>
          <span className="text-sm text-slate-400">Star Citizen</span>
        </div>
        <div className="text-slate-600">•</div>
        <div className="flex flex-col items-center gap-2">
          <Gamepad2 className="w-10 h-10 text-slate-400" />
          <span className="text-sm text-slate-400">Your Game Here</span>
        </div>
      </div>

      {/* Feature Pills */}
      <div className="flex flex-wrap justify-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/60 rounded-full border border-slate-700">
          <Users className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-slate-300">Guild Management</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/60 rounded-full border border-slate-700">
          <Zap className="w-4 h-4 text-yellow-400" />
          <span className="text-sm text-slate-300">Real-time Coordination</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/60 rounded-full border border-slate-700">
          <span className="text-lg">📊</span>
          <span className="text-sm text-slate-300">Full Analytics</span>
        </div>
      </div>
    </div>
  );
}
