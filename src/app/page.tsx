'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Sword, Hammer, Pickaxe } from 'lucide-react';

export default function Home() {
  const [clanName, setClanName] = useState('');
  const router = useRouter();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (clanName.trim()) {
      // Convert to URL-friendly slug
      const slug = clanName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      router.push(`/${slug}`);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      {/* Hero section */}
      <div className="text-center max-w-2xl mx-auto">
        {/* Logo/Icon cluster */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <Pickaxe className="w-8 h-8 text-amber-400" />
          <Hammer className="w-10 h-10 text-orange-400" />
          <Sword className="w-8 h-8 text-rose-400" />
        </div>

        {/* Title */}
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-orange-400 via-amber-300 to-orange-400 bg-clip-text text-transparent">
          AoC Profession Planner
        </h1>

        <p className="text-slate-400 text-lg mb-8">
          Plan and manage your guild&apos;s artisan professions for Ashes of Creation
        </p>

        {/* Clan entry form */}
        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="relative">
            <input
              type="text"
              value={clanName}
              onChange={(e) => setClanName(e.target.value)}
              placeholder="Enter your clan name..."
              className="w-full px-6 py-4 bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg"
              autoFocus
            />
            <button
              type="submit"
              disabled={!clanName.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-md hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Enter
            </button>
          </div>
          <p className="text-slate-500 text-sm mt-3">
            Your clan data will be saved automatically and accessible via URL
          </p>
        </form>
      </div>

      {/* Feature highlights */}
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <FeatureCard
          icon={<Pickaxe className="w-6 h-6 text-amber-400" />}
          title="Track All 22 Professions"
          description="Gathering, Processing, and Crafting with full dependency chains"
        />
        <FeatureCard
          icon={<Hammer className="w-6 h-6 text-cyan-400" />}
          title="Manage Guild Members"
          description="Assign ranks from Apprentice to Grandmaster"
        />
        <FeatureCard
          icon={<Sword className="w-6 h-6 text-rose-400" />}
          title="Guild Coverage Matrix"
          description="See your guild's productive strength at a glance"
        />
      </div>

      {/* Footer */}
      <footer className="mt-16 text-slate-600 text-sm">
        Built for Ashes of Creation • Data saved to cloud
      </footer>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800 rounded-lg p-6 text-center">
      <div className="flex justify-center mb-3">{icon}</div>
      <h3 className="font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm">{description}</p>
    </div>
  );
}
