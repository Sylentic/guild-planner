import { Users, BarChart3, Zap } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function LandingFeatureHighlights() {
  const { t } = useLanguage();
  
  const features = [
    {
      icon: Users,
      titleKey: 'home.featureMemberTitle',
      descKey: 'home.featureMemberDesc',
      color: 'blue',
    },
    {
      icon: Zap,
      titleKey: 'home.featureSyncTitle',
      descKey: 'home.featureSyncDesc',
      color: 'purple',
    },
    {
      icon: BarChart3,
      titleKey: 'home.featureInsightsTitle',
      descKey: 'home.featureInsightsDesc',
      color: 'pink',
    },
  ];

  return (
    <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto px-4">
      {features.map((feature, idx) => {
        const Icon = feature.icon;
        const colorMap: Record<string, { bg: string; text: string; hover: string }> = {
          blue: { bg: 'bg-blue-500/20', text: 'text-blue-400', hover: 'group-hover:bg-blue-500/30' },
          purple: { bg: 'bg-purple-500/20', text: 'text-purple-400', hover: 'group-hover:bg-purple-500/30' },
          pink: { bg: 'bg-pink-500/20', text: 'text-pink-400', hover: 'group-hover:bg-pink-500/30' },
        };
        const colors = colorMap[feature.color];
        const hoverBorder = feature.color === 'blue' ? 'hover:border-blue-500/50' : feature.color === 'purple' ? 'hover:border-purple-500/50' : 'hover:border-pink-500/50';

        return (
          <div key={idx} className={`group p-8 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 ${hoverBorder} transition`}>
            <div className={`w-12 h-12 rounded-lg ${colors.bg} flex items-center justify-center mb-4 ${colors.hover} transition`}>
              <Icon className={`w-6 h-6 ${colors.text}`} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {t(feature.titleKey)}
            </h3>
            <p className="text-slate-400 text-sm">
              {t(feature.descKey)}
            </p>
          </div>
        );
      })}
    </div>
  );
}

