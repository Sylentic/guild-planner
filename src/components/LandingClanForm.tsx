import { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';

interface LandingClanFormProps {
  clanName: string;
  setClanName: (name: string) => void;
  user: any;
}

export function LandingClanForm({ clanName, setClanName, user }: LandingClanFormProps) {
  const { t } = useLanguage();
  const router = useRouter();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (clanName.trim()) {
      const slug = clanName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      router.push(`/${slug}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <div className="flex gap-2">
        <input
          type="text"
          value={clanName}
          onChange={(e) => setClanName(e.target.value)}
          placeholder={t('home.enterClanPlaceholder')}
          className="flex-1 px-6 py-4 bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg"
          autoFocus
        />
        <button
          type="submit"
          disabled={!clanName.trim()}
          className="px-6 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-md hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
        >
          {t('common.enter')}
        </button>
      </div>
      <p className="text-slate-500 text-sm mt-3">
        {user
          ? t('home.loggedInHint')
          : t('home.notLoggedInHint')}
      </p>
    </form>
  );
}
