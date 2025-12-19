'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Clan, MemberWithProfessions, RankLevel } from '@/lib/types';

interface UseClanDataReturn {
  clan: Clan | null;
  members: MemberWithProfessions[];
  loading: boolean;
  error: string | null;
  // Actions
  addMember: (name: string) => Promise<void>;
  updateMember: (id: string, name: string) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
  setProfessionRank: (memberId: string, professionId: string, rank: RankLevel | null) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useClanData(clanSlug: string): UseClanDataReturn {
  const [clan, setClan] = useState<Clan | null>(null);
  const [members, setMembers] = useState<MemberWithProfessions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch or create clan
  const fetchOrCreateClan = useCallback(async (): Promise<Clan | null> => {
    try {
      // Try to find existing clan
      const { data: existingClan, error: fetchError } = await supabase
        .from('clans')
        .select('*')
        .eq('slug', clanSlug)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 = no rows returned, which is fine
        throw fetchError;
      }

      if (existingClan) {
        return existingClan as Clan;
      }

      // Create new clan
      const { data: newClan, error: createError } = await supabase
        .from('clans')
        .insert({
          slug: clanSlug,
          name: clanSlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        })
        .select()
        .single();

      if (createError) throw createError;
      return newClan as Clan;
    } catch (err) {
      console.error('Error fetching/creating clan:', err);
      setError(err instanceof Error ? err.message : 'Failed to load clan');
      return null;
    }
  }, [clanSlug]);

  // Fetch all data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const clanData = await fetchOrCreateClan();
      if (!clanData) return;

      setClan(clanData);

      // Fetch members with their professions
      const { data: membersData, error: membersError } = await supabase
        .from('members')
        .select(`
          *,
          member_professions (*)
        `)
        .eq('clan_id', clanData.id)
        .order('name');

      if (membersError) throw membersError;

      const membersWithProfessions: MemberWithProfessions[] = (membersData || []).map((member) => ({
        ...member,
        professions: member.member_professions || [],
      }));

      setMembers(membersWithProfessions);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [fetchOrCreateClan]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Add member
  const addMember = async (name: string) => {
    if (!clan) return;

    const { error: insertError } = await supabase
      .from('members')
      .insert({ clan_id: clan.id, name });

    if (insertError) {
      console.error('Error adding member:', insertError);
      setError(insertError.message);
      return;
    }

    await fetchData();
  };

  // Update member
  const updateMember = async (id: string, name: string) => {
    const { error: updateError } = await supabase
      .from('members')
      .update({ name })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating member:', updateError);
      setError(updateError.message);
      return;
    }

    await fetchData();
  };

  // Delete member
  const deleteMember = async (id: string) => {
    const { error: deleteError } = await supabase
      .from('members')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting member:', deleteError);
      setError(deleteError.message);
      return;
    }

    await fetchData();
  };

  // Set profession rank (null to remove) - uses optimistic updates
  const setProfessionRank = async (
    memberId: string,
    professionId: string,
    rank: RankLevel | null
  ) => {
    // Optimistic update - update local state immediately
    setMembers((prevMembers) =>
      prevMembers.map((member) => {
        if (member.id !== memberId) return member;

        let updatedProfessions = [...member.professions];

        if (rank === null) {
          // Remove profession
          updatedProfessions = updatedProfessions.filter(
            (p) => p.profession !== professionId
          );
        } else {
          // Add or update profession
          const existingIndex = updatedProfessions.findIndex(
            (p) => p.profession === professionId
          );
          if (existingIndex >= 0) {
            updatedProfessions[existingIndex] = {
              ...updatedProfessions[existingIndex],
              rank,
            };
          } else {
            updatedProfessions.push({
              id: `temp-${Date.now()}`, // Temporary ID
              member_id: memberId,
              profession: professionId,
              rank,
            });
          }
        }

        return { ...member, professions: updatedProfessions };
      })
    );

    // Persist to database in background
    try {
      if (rank === null) {
        const { error: deleteError } = await supabase
          .from('member_professions')
          .delete()
          .eq('member_id', memberId)
          .eq('profession', professionId);

        if (deleteError) throw deleteError;
      } else {
        const { error: upsertError } = await supabase
          .from('member_professions')
          .upsert(
            { member_id: memberId, profession: professionId, rank },
            { onConflict: 'member_id,profession' }
          );

        if (upsertError) throw upsertError;
      }
    } catch (err) {
      console.error('Error setting profession rank:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profession');
      // Revert on error by refetching
      await fetchData();
    }
  };

  return {
    clan,
    members,
    loading,
    error,
    addMember,
    updateMember,
    deleteMember,
    setProfessionRank,
    refresh: fetchData,
  };
}
