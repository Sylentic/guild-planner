'use client';

import { MoreHorizontal } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function MorePage() {
  const { t } = useLanguage();
  
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <MoreHorizontal className="w-16 h-16 text-slate-600 mb-4" />
      <h2 className="text-2xl font-bold text-white mb-2">{t('more_features')}</h2>
      <p className="text-slate-400 max-w-md">
        {t('more_menu_description')}
      </p>
    </div>
  );
}