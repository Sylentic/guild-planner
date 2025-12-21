'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { AllianceWithMembers, AllianceStatus } from '@/lib/types';

export interface AllianceData {
  name: string;
  description?: string;
  is_public?: boolean;
  max_guilds?: number;
}

interface UseAlliancesReturn {
  alliances: AllianceWithMembers[];
  myAlliance: AllianceWithMembers | null;
  loading: boolean;
  error: string | null;
  createAlliance: (data: AllianceData) => Promise<string>;
  updateAlliance: (id: string, data: Partial<AllianceData>) => Promise<void>;
  dissolveAlliance: (id: string) => Promise<void>;
  inviteGuild: (allianceId: string, clanId: string) => Promise<void>;
  respondToInvite: (memberId: string, accept: boolean) => Promise<void>;
  leaveAlliance: (allianceId: string) => Promise<void>;
  updateMemberPermissions: (memberId: string, canInvite: boolean, canCreateEvents: boolean) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useAlliances(clanId: string | null): UseAlliancesReturn {
  const [alliances, setAlliances] = useState<AllianceWithMembers[]>([]);
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
      // Get alliances where this clan is a member
      const { data: memberships, error: memberError } = await supabase
        .from('alliance_members')
        .select('alliance_id')
        .eq('clan_id', clanId)
        .in('status', ['active', 'pending']);

      if (memberError) throw memberError;

      if (!memberships || memberships.length === 0) {
        setAlliances([]);
        setLoading(false);
        return;
      }

      const allianceIds = memberships.map((m) => m.alliance_id);

      // Fetch full alliance data
      const { data: allianceData, error: allianceError } = await supabase
        .from('alliances')
        .select(`
          *,
          alliance_members (
            *,
            clans:clan_id (name, slug)
          )
        `)
        .in('id', allianceIds);

      if (allianceError) throw allianceError;

      const transformed = (allianceData || []).map((a) => ({
        ...a,
        members: (a.alliance_members || []).map((m: Record<string, unknown>) => ({
          ...m,
          clan: m.clans,
        })),
      })) as AllianceWithMembers[];

      setAlliances(transformed);
    } catch (err) {
      console.error('Error fetching alliances:', err);
      setError(err instanceof Error ? err.message : 'Failed to load alliances');
    } finally {
      setLoading(false);
    }
  }, [clanId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const myAlliance = alliances.find((a) =>
    a.members.some((m) => m.clan_id === clanId && m.status === 'active')
  ) || null;

  const createAlliance = async (data: AllianceData): Promise<string> => {
    if (!clanId) throw new Error('No clan selected');

    // Create alliance
    const { data: newAlliance, error: createError } = await supabase
      .from('alliances')
      .insert({
        ...data,
        leader_clan_id: clanId,
      })
      .select()
      .single();

    if (createError) throw createError;

    // Add self as founding member
    const { error: memberError } = await supabase
      .from('alliance_members')
      .insert({
        alliance_id: newAlliance.id,
        clan_id: clanId,
        status: 'active',
        is_founder: true,
        can_invite: true,
        can_create_events: true,
        joined_at: new Date().toISOString(),
      });

    if (memberError) throw memberError;

    await fetchData();
    return newAlliance.id;
  };

  const updateAlliance = async (id: string, data: Partial<AllianceData>) => {
    const { error: updateError } = await supabase
      .from('alliances')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (updateError) throw updateError;
    await fetchData();
  };

  const dissolveAlliance = async (id: string) => {
    // Update all members to dissolved
    await supabase
      .from('alliance_members')
      .update({ status: 'dissolved' as AllianceStatus, left_at: new Date().toISOString() })
      .eq('alliance_id', id);

    // Delete alliance
    const { error: deleteError } = await supabase
      .from('alliances')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;
    await fetchData();
  };

  const inviteGuild = async (allianceId: string, targetClanId: string) => {
    if (!clanId) throw new Error('No clan selected');

    const { error: insertError } = await supabase
      .from('alliance_members')
      .insert({
        alliance_id: allianceId,
        clan_id: targetClanId,
        status: 'pending',
        invited_by: clanId,
      });

    if (insertError) throw insertError;
    await fetchData();
  };

  const respondToInvite = async (memberId: string, accept: boolean) => {
    const status: AllianceStatus = accept ? 'active' : 'dissolved';

    const { error: updateError } = await supabase
      .from('alliance_members')
      .update({
        status,
        joined_at: accept ? new Date().toISOString() : null,
        left_at: accept ? null : new Date().toISOString(),
      })
      .eq('id', memberId);

    if (updateError) throw updateError;
    await fetchData();
  };

  const leaveAlliance = async (allianceId: string) => {
    if (!clanId) throw new Error('No clan selected');

    const { error: updateError } = await supabase
      .from('alliance_members')
      .update({
        status: 'dissolved' as AllianceStatus,
        left_at: new Date().toISOString(),
      })
      .eq('alliance_id', allianceId)
      .eq('clan_id', clanId);

    if (updateError) throw updateError;
    await fetchData();
  };

  const updateMemberPermissions = async (memberId: string, canInvite: boolean, canCreateEvents: boolean) => {
    const { error: updateError } = await supabase
      .from('alliance_members')
      .update({ can_invite: canInvite, can_create_events: canCreateEvents })
      .eq('id', memberId);

    if (updateError) throw updateError;
    await fetchData();
  };

  return {
    alliances,
    myAlliance,
    loading,
    error,
    createAlliance,
    updateAlliance,
    dissolveAlliance,
    inviteGuild,
    respondToInvite,
    leaveAlliance,
    updateMemberPermissions,
    refresh: fetchData,
  };
}
