'use client';

import { use } from 'react';
import { GameLayout } from '../GameLayout';
import { MoreHorizontal } from 'lucide-react';

export default function MorePage({ params }: { params: Promise<{ group: string; game: string }> }) {
  return (
    <GameLayout params={params} activeTab="more">
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <MoreHorizontal className="w-16 h-16 text-slate-600 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">More Features</h2>
        <p className="text-slate-400 max-w-md">
          Access additional features using the More menu in the bottom navigation bar.
        </p>
      </div>
    </GameLayout>
  );
}