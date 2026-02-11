import { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { User } from '@supabase/supabase-js';

interface LandingClanFormProps {
  groupName: string;
  setGroupName: (name: string) => void;
  user: User | null;
}

export function LandingClanForm({ groupName, setGroupName, user }: LandingClanFormProps) {
  const { t } = useLanguage();
  const router = useRouter();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (groupName.trim()) {
      const slug = groupName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      router.push(`/${slug}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto mt-8">
      <div className="relative">
        <div className="flex gap-3 p-2 bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/20">
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder={t('home.enterClanPlaceholder')}
            className="flex-1 px-5 py-4 bg-transparent text-white placeholder-slate-500 focus:outline-none text-lg"
            autoFocus
          />
          <button
            type="submit"
            disabled={!groupName.trim()}
            className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02]"
          >
            {t('common.enter')}
          </button>
        </div>
      </div>
      <p className="text-slate-500 text-sm mt-4 text-center">
        {user
          ? t('home.loggedInHint')
          : t('home.notLoggedInHint')}
      </p>
    </form>
  );
}

