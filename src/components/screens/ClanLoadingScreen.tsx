import { Loader2 } from 'lucide-react';

export function ClanLoadingScreen({ message }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-grid-pattern">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] animate-pulse-glow" />
      </div>
      <div className="text-center px-4">
        <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
        </div>
        <p className="text-slate-400 text-sm sm:text-base">{message || 'Loading...'}</p>
      </div>
    </div>
  );
}

