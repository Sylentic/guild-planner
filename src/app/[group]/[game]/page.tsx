"use client";
import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function GameGroupPage({ params }: { params: Promise<{ group: string; game: string }> }) {
  const { group: groupSlug, game: gameSlug } = use(params);
  const router = useRouter();
  
  // Redirect to /characters as the default view
  useEffect(() => {
    router.replace(`/${groupSlug}/${gameSlug}/characters`);
  }, [groupSlug, gameSlug, router]);

  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
    </div>
  );
}


