import { Users, BarChart3, Zap } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function LandingFeatureHighlights() {
  const { t } = useLanguage();
  
  const features = [
    {
      icon: Users,
      titleKey: 'home.featureMemberTitle',
      descKey: 'home.featureMemberDesc',
    },
    {
      icon: Zap,
      titleKey: 'home.featureSyncTitle',
      descKey: 'home.featureSyncDesc',
    },
    {
      icon: BarChart3,
      titleKey: 'home.featureInsightsTitle',
      descKey: 'home.featureInsightsDesc',
    },
  ];

  return (
    <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl mx-auto px-4">
      {features.map((feature, idx) => {
        const Icon = feature.icon;
        return (
          <div 
            key={idx} 
            className="group relative p-6 rounded-2xl bg-slate-900/40 backdrop-blur-sm border border-slate-800/50 hover:border-indigo-500/30 transition-all duration-300 hover:bg-slate-900/60"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            {/* Subtle gradient overlay on hover */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 group-hover:bg-indigo-500/20 group-hover:border-indigo-500/30 transition-all duration-300">
                <Icon className="w-5 h-5 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">
                {t(feature.titleKey)}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {t(feature.descKey)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

