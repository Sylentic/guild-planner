'use client';

import { MapPin, Users, Crown, Building2 } from 'lucide-react';
import { NodeDistribution, NODE_TYPE_CONFIG, NODE_STAGE_NAMES, NodeType, NodeStage } from '@/lib/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface NodeDistributionViewProps {
  distribution: NodeDistribution[];
  totalMembers: number;
  onNodeClick?: (nodeName: string) => void;
}

export function NodeDistributionView({
  distribution,
  totalMembers,
  onNodeClick,
}: NodeDistributionViewProps) {
  const { t } = useLanguage();

  // Sort by citizen count descending
  const sortedNodes = [...distribution].sort((a, b) => b.citizen_count - a.citizen_count);

  // Calculate totals
  const totalCitizens = distribution.reduce((sum, n) => sum + n.citizen_count, 0);
  const unassigned = totalMembers - totalCitizens;

  // Group by node type for summary
  const byType = distribution.reduce((acc, node) => {
    acc[node.node_type] = (acc[node.node_type] || 0) + node.citizen_count;
    return acc;
  }, {} as Record<NodeType, number>);

  if (distribution.length === 0) {
    return (
      <div className="bg-slate-800/50 rounded-xl p-6 text-center">
        <MapPin className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-slate-300 mb-2">
          {t('nodes.noCitizenships')}
        </h3>
        <p className="text-sm text-slate-500">
          {t('nodes.noCitizenshipsDesc')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(Object.entries(NODE_TYPE_CONFIG) as [NodeType, typeof NODE_TYPE_CONFIG[NodeType]][]).map(([type, config]) => (
          <div
            key={type}
            className="bg-slate-800/50 rounded-lg p-3 text-center"
          >
            <div className="text-2xl mb-1">{config.icon}</div>
            <div className={`text-lg font-bold ${config.color}`}>
              {byType[type] || 0}
            </div>
            <div className="text-xs text-slate-400">
              {t(`nodes.types.${type}`)}
            </div>
          </div>
        ))}
      </div>

      {/* Unassigned warning */}
      {unassigned > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-center gap-3">
          <Users className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="text-sm text-amber-400">
            {t('nodes.unassignedMembers', { count: unassigned })}
          </div>
        </div>
      )}

      {/* Node List */}
      <div className="space-y-2">
        {sortedNodes.map((node) => {
          const config = NODE_TYPE_CONFIG[node.node_type];
          const percentage = Math.round((node.citizen_count / totalMembers) * 100);

          return (
            <div
              key={node.node_name}
              onClick={() => onNodeClick?.(node.node_name)}
              className={`bg-slate-800/50 rounded-lg p-4 ${
                onNodeClick ? 'cursor-pointer hover:bg-slate-800' : ''
              } transition-colors`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{config.icon}</span>
                  <div>
                    <div className="font-medium text-white flex items-center gap-2">
                      {node.node_name}
                      {node.has_mayor && (
                        <span title={t('nodes.hasMayor')}>
                          <Crown className="w-4 h-4 text-amber-400" />
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <Building2 className="w-3 h-3" />
                      {t(`nodes.types.${node.node_type}`)} • Stage {node.node_stage} ({NODE_STAGE_NAMES[node.node_stage as NodeStage]})
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-white">{node.citizen_count}</div>
                  <div className="text-xs text-slate-400">{percentage}%</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    node.node_type === 'divine' ? 'bg-yellow-500' :
                    node.node_type === 'economic' ? 'bg-green-500' :
                    node.node_type === 'military' ? 'bg-red-500' :
                    'bg-blue-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Total footer */}
      <div className="bg-slate-900 rounded-lg p-3 flex items-center justify-between">
        <div className="text-slate-400 text-sm flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          {t('nodes.totalNodes', { count: distribution.length })}
        </div>
        <div className="text-slate-400 text-sm">
          {totalCitizens}/{totalMembers} {t('nodes.membersAssigned')}
        </div>
      </div>
    </div>
  );
}
