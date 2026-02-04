import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

export function ClanErrorScreen({
  title,
  message,
  error,
  retryLabel,
  onRetry,
  homeLabel
}: {
  title: string;
  message: string;
  error?: string;
  retryLabel?: string;
  onRetry?: () => void;
  homeLabel?: string;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">{title}</h2>
        <p className="text-slate-400 mb-6">{message}</p>
        {error && (
          <div className="bg-slate-800/50 rounded p-4 mb-6 font-mono text-xs text-red-300 text-left overflow-auto max-h-32">
            {error}
          </div>
        )}
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors cursor-pointer"
          >
            {retryLabel || 'Retry'}
          </button>
        )}
        <Link
          href="/"
          className="block mt-4 text-slate-400 hover:text-white transition-colors"
        >
          {homeLabel || 'Return Home'}
        </Link>
      </div>
    </div>
  );
}

