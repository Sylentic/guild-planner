'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
  MemberActivitySummary,
  InactivityAlert,
  ActivityType,
} from '@/lib/types';

interface UseActivityReturn {
  activitySummaries: MemberActivitySummary[];
  inactivityAlerts: InactivityAlert[];
  inactiveMemberCount: number;
  loading: boolean;
  error: string | null;
  logActivity: (type: ActivityType, description?: string, characterId?: string) => Promise<void>;
  acknowledgeAlert: (alertId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useActivity(clanId: string | null): UseActivityReturn {
  const [activitySummaries, setActivitySummaries] = useState<MemberActivitySummary[]>([]);
  const [inactivityAlerts, setInactivityAlerts] = useState<InactivityAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!clanId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch activity summaries
      const { data: summaries, error: summaryError } = await supabase
        .from('member_activity_summary')
        .select('*')
        .eq('clan_id', clanId)
        .order('total_activities_30d', { ascending: false });

      if (summaryError) throw summaryError;
      setActivitySummaries((summaries || []) as MemberActivitySummary[]);

      // Fetch unacknowledged alerts
      const { data: alerts, error: alertError } = await supabase
        .from('inactivity_alerts')
        .select('*')
        .eq('clan_id', clanId)
        .eq('is_acknowledged', false)
        .order('days_inactive', { ascending: false });

      if (alertError) throw alertError;
      setInactivityAlerts((alerts || []) as InactivityAlert[]);
    } catch (err) {
      console.error('Error fetching activity:', err);
      setError(err instanceof Error ? err.message : 'Failed to load activity');
    } finally {
      setLoading(false);
    }
  }, [clanId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const inactiveMemberCount = activitySummaries.filter((s) => s.is_inactive).length;

  const logActivity = async (type: ActivityType, description?: string, characterId?: string) => {
    if (!clanId) throw new Error('No clan selected');

    const { data: { user } } = await supabase.auth.getUser();

    const { error: insertError } = await supabase
      .from('activity_log')
      .insert({
        clan_id: clanId,
        user_id: user?.id,
        character_id: characterId,
        activity_type: type,
        description,
      });

    if (insertError) throw insertError;
  };

  const acknowledgeAlert = async (alertId: string) => {
    const { data: { user } } = await supabase.auth.getUser();

    const { error: updateError } = await supabase
      .from('inactivity_alerts')
      .update({
        is_acknowledged: true,
        acknowledged_by: user?.id,
        acknowledged_at: new Date().toISOString(),
      })
      .eq('id', alertId);

    if (updateError) throw updateError;
    await fetchData();
  };

  return {
    activitySummaries,
    inactivityAlerts,
    inactiveMemberCount,
    loading,
    error,
    logActivity,
    acknowledgeAlert,
    refresh: fetchData,
  };
}
