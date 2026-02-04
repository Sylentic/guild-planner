'use client';

import { MemberWithProfessions, RANK_COLORS } from '@/lib/types';
import { PROFESSIONS, PROFESSIONS_BY_TIER, TIER_CONFIG, PROFESSION_BY_ID } from '@/lib/professions';
import { AlertTriangle, TrendingUp, CheckCircle, XCircle, Target } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProfessionHealthProps {
  members: MemberWithProfessions[];
}

interface ProfessionStats {
  professionId: string;
  name: string;
  tier: string;
  grandmasters: number;
  masters: number;
  total: number;
  dependencies: string[];
  hasCriticalGap: boolean; // No GM or Master
}

interface HealthMetrics {
  overallScore: number; // 0-100
  coverageScore: number; // % with any coverage
  masterScore: number; // % with Master+
  grandmasterScore: number; // % with GM
  tierBalance: { gathering: number; processing: number; crafting: number };
  criticalGaps: ProfessionStats[];
  supplyChainBreaks: { profession: string; missingDeps: string[] }[];
  recommendations: string[];
}

function calculateHealthMetrics(members: MemberWithProfessions[]): HealthMetrics {
  const stats: ProfessionStats[] = PROFESSIONS.map(prof => {
    let grandmasters = 0;
    let masters = 0;
    let total = 0;

    for (const member of members) {
      const mp = member.professions.find(p => p.profession === prof.id);
      if (mp) {
        total++;
        if (mp.rank === 4) grandmasters++;
        if (mp.rank >= 3) masters++;
      }
    }

    return {
      professionId: prof.id,
      name: prof.name,
      tier: prof.tier,
      grandmasters,
      masters,
      total,
      dependencies: prof.dependencies,
      hasCriticalGap: masters === 0,
    };
  });

  // Coverage calculations
  const totalProfs = PROFESSIONS.length;
  const covered = stats.filter(s => s.total > 0).length;
  const withMaster = stats.filter(s => s.masters > 0).length;
  const withGM = stats.filter(s => s.grandmasters > 0).length;

  const coverageScore = Math.round((covered / totalProfs) * 100);
  const masterScore = Math.round((withMaster / totalProfs) * 100);
  const grandmasterScore = Math.round((withGM / totalProfs) * 100);

  // Tier balance (ideal is roughly equal distribution)
  const tierCounts = {
    gathering: stats.filter(s => s.tier === 'gathering' && s.masters > 0).length,
    processing: stats.filter(s => s.tier === 'processing' && s.masters > 0).length,
    crafting: stats.filter(s => s.tier === 'crafting' && s.masters > 0).length,
  };
  const tierTotals = {
    gathering: PROFESSIONS_BY_TIER.gathering.length,
    processing: PROFESSIONS_BY_TIER.processing.length,
    crafting: PROFESSIONS_BY_TIER.crafting.length,
  };
  const tierBalance = {
    gathering: Math.round((tierCounts.gathering / tierTotals.gathering) * 100),
    processing: Math.round((tierCounts.processing / tierTotals.processing) * 100),
    crafting: Math.round((tierCounts.crafting / tierTotals.crafting) * 100),
  };

  // Critical gaps (no Master or above)
  const criticalGaps = stats.filter(s => s.hasCriticalGap);

  // Supply chain breaks (crafting without processing, processing without gathering)
  const supplyChainBreaks: { profession: string; missingDeps: string[] }[] = [];
  
  for (const stat of stats) {
    if (stat.masters > 0 && stat.dependencies.length > 0) {
      const missingDeps = stat.dependencies.filter(depId => {
        const depStat = stats.find(s => s.professionId === depId);
        return !depStat || depStat.masters === 0;
      });
      if (missingDeps.length > 0) {
        supplyChainBreaks.push({
          profession: stat.name,
          missingDeps: missingDeps.map(id => PROFESSION_BY_ID.get(id)?.name || id),
        });
      }
    }
  }

  // Generate recommendations
  const recommendations: string[] = [];
  
  // Priority 1: Critical crafting gaps (high-value professions)
  const criticalCrafting = criticalGaps.filter(g => g.tier === 'crafting');
  if (criticalCrafting.length > 0) {
    recommendations.push(`🔨 Priority: Train a Master in ${criticalCrafting.slice(0, 2).map(g => g.name).join(', ')}`);
  }

  // Priority 2: Supply chain breaks
  if (supplyChainBreaks.length > 0) {
    const first = supplyChainBreaks[0];
    recommendations.push(`⚠️ ${first.profession} crafters need ${first.missingDeps.join(', ')} suppliers`);
  }

  // Priority 3: Tier imbalance
  const minTier = Math.min(tierBalance.gathering, tierBalance.processing, tierBalance.crafting);
  if (minTier < 50) {
    const weakTier = tierBalance.gathering === minTier ? 'Gathering' :
                     tierBalance.processing === minTier ? 'Processing' : 'Crafting';
    recommendations.push(`📊 ${weakTier} tier is underdeveloped (${minTier}% coverage)`);
  }

  // Priority 4: GM coverage
  if (grandmasterScore < 30) {
    recommendations.push(`⭐ Consider promoting more Grandmasters (only ${withGM} of ${totalProfs})`);
  }

  // Overall score (weighted average)
  const overallScore = Math.round(
    (coverageScore * 0.2) + 
    (masterScore * 0.4) + 
    (grandmasterScore * 0.4)
  );

  return {
    overallScore,
    coverageScore,
    masterScore,
    grandmasterScore,
    tierBalance,
    criticalGaps,
    supplyChainBreaks,
    recommendations,
  };
}

function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-slate-400">{label}</span>
        <span className={`font-medium ${color}`}>{score}%</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${
            score >= 70 ? 'bg-green-500' :
            score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

function TierBar({ score, icon, color }: { score: number; icon: string; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-lg">{icon}</span>
      <div className="flex-1">
        <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full ${color}`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
      <span className="text-xs text-slate-400 w-10 text-right">{score}%</span>
    </div>
  );
}

export function ProfessionHealth({ members }: ProfessionHealthProps) {
  const metrics = calculateHealthMetrics(members);
  const { t } = useLanguage();

  const scoreColor = metrics.overallScore >= 70 ? 'text-green-400' :
                     metrics.overallScore >= 40 ? 'text-yellow-400' : 'text-red-400';

  const ScoreIcon = metrics.overallScore >= 70 ? CheckCircle :
                    metrics.overallScore >= 40 ? TrendingUp : XCircle;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
      {/* Overall Score */}
      <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg border border-slate-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-slate-400">{t('matrix.clanReadiness')}</h3>
          <ScoreIcon className={`w-5 h-5 ${scoreColor}`} />
        </div>
        <div className="text-4xl font-bold mb-4">
          <span className={scoreColor}>{metrics.overallScore}</span>
          <span className="text-slate-600 text-2xl">/100</span>
        </div>
        <div className="space-y-3">
          <ScoreBar label={t('matrix.anyCoverage')} score={metrics.coverageScore} color="text-slate-300" />
          <ScoreBar label="Master+" score={metrics.masterScore} color={RANK_COLORS[3].text} />
          <ScoreBar label="Grandmaster" score={metrics.grandmasterScore} color={RANK_COLORS[4].text} />
        </div>
      </div>

      {/* Tier Balance */}
      <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg border border-slate-700 p-4">
        <h3 className="text-sm font-medium text-slate-400 mb-4">{t('matrix.tierBalance')}</h3>
        <div className="space-y-4">
          <TierBar 
            score={metrics.tierBalance.gathering} 
            icon={TIER_CONFIG.gathering.icon}
            color="bg-amber-500"
          />
          <TierBar 
            score={metrics.tierBalance.processing} 
            icon={TIER_CONFIG.processing.icon}
            color="bg-cyan-500"
          />
          <TierBar 
            score={metrics.tierBalance.crafting} 
            icon={TIER_CONFIG.crafting.icon}
            color="bg-rose-500"
          />
        </div>
        
        {/* Critical Gaps Count */}
        {metrics.criticalGaps.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle size={14} />
              <span className="text-sm">
                {metrics.criticalGaps.length} {t('matrix.professionsWithoutMaster').replace('{{count}}', '')}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Recommendations */}
      <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg border border-slate-700 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-4 h-4 text-orange-400" />
          <h3 className="text-sm font-medium text-slate-400">{t('matrix.recommendations')}</h3>
        </div>
        {metrics.recommendations.length > 0 ? (
          <ul className="space-y-2">
            {metrics.recommendations.slice(0, 4).map((rec, i) => (
              <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                <span className="text-slate-600 shrink-0">{i + 1}.</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-sm text-green-400 flex items-center gap-2">
            <CheckCircle size={16} />
            <span>{t('matrix.wellBalanced')}</span>
          </div>
        )}

        {/* Supply Chain Breaks */}
        {metrics.supplyChainBreaks.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-800">
            <div className="text-xs text-slate-500 mb-2">{t('matrix.supplyChainIssues')}:</div>
            {metrics.supplyChainBreaks.slice(0, 2).map((brk, i) => (
              <div key={i} className="text-xs text-yellow-400">
                {brk.profession} ← missing {brk.missingDeps.join(', ')}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

