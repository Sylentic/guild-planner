import { Loader2 } from 'lucide-react';

export function ClanLoadingScreen({ message }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-orange-400 animate-spin mx-auto mb-4" />
        <p className="text-slate-400">{message || 'Loading...'}</p>
      </div>
    </div>
  );
}

