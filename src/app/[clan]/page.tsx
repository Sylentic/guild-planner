'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { Users, Grid3X3, Home, Loader2, AlertCircle } from 'lucide-react';
import { useClanData } from '@/hooks/useClanData';
import { MemberCard } from '@/components/MemberCard';
import { AddMemberForm } from '@/components/AddMemberForm';
import { ClanMatrix } from '@/components/ClanMatrix';

type Tab = 'members' | 'matrix';

export default function ClanPage({ params }: { params: Promise<{ clan: string }> }) {
  const { clan: clanSlug } = use(params);
  const [activeTab, setActiveTab] = useState<Tab>('members');
  const {
    clan,
    members,
    loading,
    error,
    addMember,
    updateMember,
    deleteMember,
    setProfessionRank,
  } = useClanData(clanSlug);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-orange-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading clan data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Error Loading Clan</h2>
          <p className="text-slate-400 mb-4">{error}</p>
          <p className="text-slate-500 text-sm">
            Make sure you have configured your Supabase environment variables correctly.
          </p>
          <Link
            href="/"
            className="inline-block mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white transition-colors cursor-pointer"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Navigation */}
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="p-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Home"
              >
                <Home size={20} />
              </Link>
              <div>
                <h1 className="font-display text-xl font-semibold text-white">
                  {clan?.name || clanSlug}
                </h1>
                <p className="text-slate-500 text-sm">{members.length} members</p>
              </div>
            </div>

            {/* Right: Tab navigation */}
            <div className="flex bg-slate-800/50 rounded-lg p-1">
              <TabButton
                icon={<Users size={18} />}
                label="Members"
                isActive={activeTab === 'members'}
                onClick={() => setActiveTab('members')}
              />
              <TabButton
                icon={<Grid3X3 size={18} />}
                label="Matrix"
                isActive={activeTab === 'matrix'}
                onClick={() => setActiveTab('matrix')}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'members' ? (
          <div className="space-y-4">
            <AddMemberForm onAdd={addMember} />
            {members.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No members yet. Add your first guild member above!</p>
              </div>
            ) : (
              members.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  onUpdate={updateMember}
                  onDelete={deleteMember}
                  onSetProfessionRank={setProfessionRank}
                />
              ))
            )}
          </div>
        ) : (
          <ClanMatrix members={members} />
        )}
      </main>
    </div>
  );
}

function TabButton({
  icon,
  label,
  isActive,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
        isActive
          ? 'bg-orange-500 text-white'
          : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
