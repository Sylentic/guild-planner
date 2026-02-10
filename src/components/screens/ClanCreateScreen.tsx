
import { UserPlus } from 'lucide-react';
import Link from 'next/link';

export function ClanCreateScreen({
  title,
  message,
  onCreate,
  creating,
  createLabel,
  adminNote,
  homeLabel
}: {
  title: string;
  message: string;
  onCreate: () => void;
  creating?: boolean;
  createLabel?: string;
  adminNote?: string;
  homeLabel?: string;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-grid-pattern px-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[100px]" />
      </div>
      <div className="text-center max-w-md mx-auto">
        <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
          <UserPlus className="w-7 h-7 text-amber-400" />
        </div>
        <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3">{title}</h2>
        <p className="text-slate-400 mb-6 text-sm sm:text-base">{message}</p>
        <button
          onClick={onCreate}
          disabled={creating}
          className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40"
        >
          {creating ? 'Creating...' : (createLabel || 'Create Clan')}
        </button>
        {adminNote && <p className="text-slate-500 text-sm mt-4">{adminNote}</p>}
        <Link
          href="/"
          className="inline-block mt-5 text-slate-400 hover:text-white transition-colors text-sm sm:text-base"
        >
          ← {homeLabel || 'Return Home'}
        </Link>
      </div>
    </div>
  );
}

