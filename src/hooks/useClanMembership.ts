'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { UserRole, applyToClan, getClanMembership } from '@/lib/auth';
import { ClanRole } from '@/lib/permissions';

interface ClanMember {
  id: string;
  user_id: string;
  role: UserRole;
  is_creator: boolean;
  applied_at: string;
  approved_at: string | null;
  user: {
    display_name: string | null;
    discord_username: string | null;
    discord_avatar: string | null;
  } | null;
}

interface UseClanMembershipReturn {
  membership: {
    role: UserRole;
    isCreator: boolean;
    isApproved: boolean;
  } | null;
  members: ClanMember[];
  pendingMembers: ClanMember[];
  loading: boolean;
  error: string | null;
  apply: () => Promise<void>;
  acceptMember: (membershipId: string) => Promise<void>;
  rejectMember: (membershipId: string) => Promise<void>;
  updateRole: (membershipId: string, role: ClanRole) => Promise<void>;
  removeMember: (membershipId: string) => Promise<void>;
  refresh: () => Promise<void>;
  // Permission helpers
  canView: boolean;
  canEdit: boolean;
  canManageMembers: boolean;
  canManageRoles: boolean;
}

export function useClanMembership(clanId: string | null, userId: string | null): UseClanMembershipReturn {
  const [membership, setMembership] = useState<UseClanMembershipReturn['membership']>(null);
  const [members, setMembers] = useState<ClanMember[]>([]);
  const [pendingMembers, setPendingMembers] = useState<ClanMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembership = useCallback(async () => {
    console.log('[DEBUG] useClanMembership: clanId', clanId, 'userId', userId);
    if (!clanId || !userId) {
      setMembership(null);
      setLoading(false);
      return;
    }

    try {
      const data = await getClanMembership(clanId, userId);
      console.log('[DEBUG] getClanMembership returned:', data);
      if (data) {
        setMembership({
          role: data.role as UserRole,
          isCreator: data.is_creator,
          isApproved: data.role !== 'pending',
        });
      } else {
        setMembership(null);
      }
    } catch (err) {
      console.error('Error fetching membership:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch membership');
    }
  }, [clanId, userId]);

  const fetchMembers = useCallback(async () => {
    if (!clanId) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('clan_members')
        .select(`
          id,
          user_id,
          role,
          is_creator,
          applied_at,
          approved_at,
          users!clan_members_user_id_fkey(display_name, discord_username, discord_avatar)
        `)
        .eq('clan_id', clanId)
        .order('role');

      if (fetchError) throw fetchError;

      // Transform data - Supabase returns users as array or object depending on relationship
      const transformed = (data || []).map(m => ({
        ...m,
        user: Array.isArray(m.users) ? m.users[0] || null : m.users,
      })) as ClanMember[];

      const approved = transformed.filter(m => m.role !== 'pending');
      const pending = transformed.filter(m => m.role === 'pending');

      setMembers(approved);
      setPendingMembers(pending);
    } catch (err) {
      console.error('Error fetching members:', err);
    }
  }, [clanId]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([fetchMembership(), fetchMembers()]);
    } catch (e) {
      console.error('Error refreshing clan membership:', e);
      setError(e instanceof Error ? e.message : 'Failed to refresh membership');
    } finally {
      setLoading(false);
    }
  }, [fetchMembership, fetchMembers]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const apply = async () => {
    if (!clanId || !userId) throw new Error('Not authenticated');
    await applyToClan(clanId, userId);
    await refresh();
  };

  const acceptMember = async (membershipId: string) => {
    if (!userId) throw new Error('Not authenticated');
    
    const { error } = await supabase
      .from('clan_members')
      .update({
        role: 'member',
        approved_at: new Date().toISOString(),
        approved_by: userId,
      })
      .eq('id', membershipId)
      .select();

    if (error) throw error;
    await refresh();
  };

  const rejectMember = async (membershipId: string) => {
    const { error } = await supabase
      .from('clan_members')
      .delete()
      .eq('id', membershipId)
      .select();

    if (error) throw error;
    await refresh();
  };

  const updateRole = async (membershipId: string, role: ClanRole) => {
    const { error } = await supabase
      .from('clan_members')
      .update({ role })
      .eq('id', membershipId)
      .select();

    if (error) throw error;
    await refresh();
  };

  const removeMember = async (membershipId: string) => {
    await rejectMember(membershipId);
  };

  // Permission helpers
  const canView = membership?.role !== 'pending' && membership?.role !== null;
  const canEdit = membership?.role === 'admin' || membership?.role === 'officer';
  const canManageMembers = membership?.role === 'admin' || membership?.role === 'officer';
  const canManageRoles = membership?.role === 'admin';

  return {
    membership,
    members,
    pendingMembers,
    loading,
    error,
    apply,
    acceptMember,
    rejectMember,
    updateRole,
    removeMember,
    refresh,
    canView,
    canEdit,
    canManageMembers,
    canManageRoles,
  };
}
