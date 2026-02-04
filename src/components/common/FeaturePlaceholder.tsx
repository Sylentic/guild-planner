'use client';

import { Construction } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface FeaturePlaceholderProps {
  icon: React.ElementType;
  titleKey: string;
  descKey: string;
  color?: 'orange' | 'amber' | 'purple' | 'cyan';
}

export function FeaturePlaceholder({
  icon: Icon,
  titleKey,
  descKey,
  color = 'orange',
}: FeaturePlaceholderProps) {
  const { t } = useLanguage();

  const colorClasses = {
    orange: 'text-orange-400',
    amber: 'text-amber-400',
    purple: 'text-purple-400',
    cyan: 'text-cyan-400',
  };

  return (
    <div className="bg-slate-800/50 rounded-xl p-8 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-700/50 flex items-center justify-center">
        <Icon className={`w-8 h-8 ${colorClasses[color]}`} />
      </div>
      <h3 className="text-lg font-medium text-slate-300 mb-2">
        {t(titleKey)}
      </h3>
      <p className="text-sm text-slate-500 mb-4">
        {t(descKey)}
      </p>
      <div className="flex items-center justify-center gap-2 text-xs text-slate-600">
        <Construction className="w-4 h-4" />
        {t('common.comingSoon')}
      </div>
    </div>
  );
}

