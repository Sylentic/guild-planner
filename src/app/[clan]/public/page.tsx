'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Users, Briefcase, Calendar, ChevronRight, ExternalLink, Home } from 'lucide-react';
import { Clan, PARTY_ROLES } from '@/lib/types';
import { ARCHETYPES } from '@/lib/characters';
import { RecruitmentForm } from '@/components/RecruitmentForm';

interface PublicClanData {
  clan: Clan & {
    is_public: boolean;
    recruitment_open: boolean;
    recruitment_message?: string;
    public_description?: string;
  };
  memberCount: number;
  professionCoverage: number;
  upcomingEvents: number;
}

export default function PublicClanPage({ params }: { params: Promise<{ clan: string }> }) {
  const { clan: clanSlug } = use(params);
  const [data, setData] = useState<PublicClanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRecruitmentForm, setShowRecruitmentForm] = useState(false);

  useEffect(() => {
    async function fetchPublicData() {
      try {
        // Use API route to get public data (bypasses RLS)
        const response = await fetch(`/api/clan-public?slug=${encodeURIComponent(clanSlug)}`);
        
        if (!response.ok) {
          setData(null);
          setLoading(false);
          return;
        }

        const publicData = await response.json();
        
        setData({
          clan: publicData.clan,
          memberCount: publicData.memberCount || 0,
          professionCoverage: 75, // Could calculate this
          upcomingEvents: publicData.upcomingEvents || 0,
        });
      } catch (error) {
        console.error('Error fetching public data:', error);
        setData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchPublicData();
  }, [clanSlug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Clan Not Found</h1>
          <p className="text-slate-400 mb-6">This clan doesn&apos;t exist or isn&apos;t public.</p>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            <Home size={18} />
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const { clan, memberCount, professionCoverage, upcomingEvents } = data;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white font-display">{clan.name}</h1>
              <p className="text-slate-400 mt-1">Ashes of Creation Guild</p>
            </div>
            <Link
              href={`/${clanSlug}`}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
            >
              <ExternalLink size={16} />
              Member Login
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Description */}
        {clan.public_description && (
          <section className="bg-slate-900/80 backdrop-blur-sm rounded-lg border border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-white mb-3">About Us</h2>
            <p className="text-slate-300 whitespace-pre-wrap">{clan.public_description}</p>
          </section>
        )}

        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg border border-slate-700 p-4 text-center">
            <Users size={24} className="mx-auto mb-2 text-blue-400" />
            <div className="text-2xl font-bold text-white">{memberCount}</div>
            <div className="text-sm text-slate-400">Members</div>
          </div>
          <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg border border-slate-700 p-4 text-center">
            <Briefcase size={24} className="mx-auto mb-2 text-green-400" />
            <div className="text-2xl font-bold text-white">{professionCoverage}%</div>
            <div className="text-sm text-slate-400">Profession Coverage</div>
          </div>
          <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg border border-slate-700 p-4 text-center">
            <Calendar size={24} className="mx-auto mb-2 text-purple-400" />
            <div className="text-2xl font-bold text-white">{upcomingEvents}</div>
            <div className="text-sm text-slate-400">Upcoming Events</div>
          </div>
        </section>

        {/* Looking for */}
        <section className="bg-slate-900/80 backdrop-blur-sm rounded-lg border border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">We&apos;re Looking For</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(['tank', 'cleric', 'bard', 'ranged_dps', 'melee_dps'] as const).map(role => (
              <div 
                key={role}
                className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-lg"
              >
                <span className="text-xl">{PARTY_ROLES[role].icon}</span>
                <span className={`text-sm font-medium ${PARTY_ROLES[role].color}`}>
                  {PARTY_ROLES[role].name}
                </span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
            {Object.entries(ARCHETYPES).slice(0, 4).map(([id, arch]) => (
              <div 
                key={id}
                className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-lg"
              >
                <span className="text-xl">{arch.icon}</span>
                <span className="text-sm text-slate-300">{arch.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Recruitment CTA */}
        {clan.recruitment_open && (
          <section className="bg-gradient-to-r from-orange-500/20 to-rose-500/20 rounded-lg border border-orange-500/30 p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">Join Our Guild!</h2>
                <p className="text-slate-300 mt-1">
                  {clan.recruitment_message || 'We are currently recruiting new members.'}
                </p>
              </div>
              <button
                onClick={() => setShowRecruitmentForm(true)}
                className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                Apply Now
                <ChevronRight size={18} />
              </button>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-12 py-6">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-slate-500">
          <p>Powered by AoC Guild Profession Planner</p>
          <Link href="/" className="text-orange-400 hover:text-orange-300">
            Create your own guild page →
          </Link>
        </div>
      </footer>

      {/* Recruitment Form Modal */}
      {showRecruitmentForm && (
        <RecruitmentForm
          clanId={clan.id}
          clanName={clan.name}
          onClose={() => setShowRecruitmentForm(false)}
          onSuccess={() => {
            setShowRecruitmentForm(false);
            alert('Application submitted! The guild leadership will review it soon.');
          }}
        />
      )}
    </div>
  );
}
