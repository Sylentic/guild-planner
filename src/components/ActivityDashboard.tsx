'use client';

import { AlertTriangle, Activity, Users, Clock, CheckCircle, TrendingDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { MemberActivitySummary, InactivityAlert } from '@/lib/types';

// Extended interfaces with optional user data (joined from parent)
interface ActivitySummaryWithUser extends MemberActivitySummary {
  user?: {
    display_name: string;
  };
}

interface InactivityAlertWithUser extends InactivityAlert {
  user?: {
    display_name: string;
  };
}

interface ActivityDashboardProps {
  activitySummaries: ActivitySummaryWithUser[];
  inactivityAlerts: InactivityAlertWithUser[];
  inactiveMemberCount: number;
  onAcknowledgeAlert?: (alertId: string) => Promise<void>;
  isOfficer: boolean;
}

/**
 * Dashboard for officers to monitor guild activity and inactive members
 */
export function ActivityDashboard({
  activitySummaries,
  inactivityAlerts,
  inactiveMemberCount,
  onAcknowledgeAlert,
  isOfficer,
}: ActivityDashboardProps) {
  const { t } = useLanguage();

  // Get alert level color
  const getAlertColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'warning':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    }
  };

  // Format date
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return t('activity.never');
    const date = new Date(dateStr);
    return date.toLocaleDateString(Intl.DateTimeFormat().resolvedOptions().timeZone, {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
  };

  // Get top active members (last 30 days)
  const topActive = activitySummaries
    .filter(s => s.total_activities_30d > 0)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-800/80 border border-slate-700 rounded-lg p-4 text-center">
          <Users className="w-6 h-6 text-slate-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{activitySummaries.length}</div>
          <div className="text-xs text-slate-500">{t('activity.totalMembers')}</div>
        </div>
        <div className="bg-slate-800/80 border border-slate-700 rounded-lg p-4 text-center">
          <Activity className="w-6 h-6 text-green-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-green-400">
            {activitySummaries.filter(s => !s.is_inactive).length}
          </div>
          <div className="text-xs text-slate-500">{t('activity.activeMembers')}</div>
        </div>
        <div className="bg-slate-800/80 border border-slate-700 rounded-lg p-4 text-center">
          <TrendingDown className="w-6 h-6 text-amber-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-amber-400">{inactiveMemberCount}</div>
          <div className="text-xs text-slate-500">{t('activity.inactiveMembers')}</div>
        </div>
        <div className="bg-slate-800/80 border border-slate-700 rounded-lg p-4 text-center">
          <AlertTriangle className="w-6 h-6 text-red-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-red-400">{inactivityAlerts.length}</div>
          <div className="text-xs text-slate-500">{t('activity.pendingAlerts')}</div>
        </div>
      </div>

      {/* Inactivity Alerts */}
      {inactivityAlerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            {t('activity.inactivityAlerts')}
          </h3>
          <div className="space-y-2">
            {inactivityAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border ${getAlertColor(alert.alert_level)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="font-medium text-white">
                        {alert.user?.display_name || 'Unknown'}
                      </div>
                      <div className="text-sm opacity-80">
                        {alert.days_inactive} {t('activity.daysInactive')}
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      alert.alert_level === 'critical' ? 'bg-red-500/30' : 'bg-amber-500/30'
                    }`}>
                      {t(`activity.${alert.alert_level}`)}
                    </span>
                  </div>
                  {isOfficer && onAcknowledgeAlert && (
                    <button
                      onClick={() => onAcknowledgeAlert(alert.id)}
                      className="flex items-center gap-1 px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {t('activity.acknowledge')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Active Members */}
      {topActive.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-400" />
            {t('activity.topActive')}
          </h3>
          <div className="bg-slate-800/50 rounded-lg overflow-hidden">
            {topActive.map((member, index) => (
              <div
                key={member.user_id}
                className="flex items-center justify-between p-3 border-b border-slate-700 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 flex items-center justify-center bg-slate-700 rounded text-sm font-medium text-slate-300">
                    {index + 1}
                  </span>
                  <div>
                    <div className="font-medium text-white">{member.user?.display_name || 'Unknown'}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      {t('activity.lastActivity')}: {formatDate(member.last_activity_at ?? null)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-400">{member.total_activities_30d}</div>
                  <div className="text-xs text-slate-500">{t('activity.activities30d')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Activity Data */}
      {activitySummaries.length === 0 && inactivityAlerts.length === 0 && (
        <div className="bg-slate-800/50 rounded-xl p-8 text-center">
          <Activity className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-300 mb-2">
            {t('activity.noActivityData')}
          </h3>
          <p className="text-sm text-slate-500">
            {t('activity.noActivityDesc')}
          </p>
        </div>
      )}
    </div>
  );
}
