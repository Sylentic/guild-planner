'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Clan, CharacterWithProfessions, RankLevel, Race, Archetype } from '@/lib/types';

// Character data for creating/updating
export interface CharacterData {
  name: string;
  race?: Race | null;
  primary_archetype?: Archetype | null;
  secondary_archetype?: Archetype | null;
  level?: number;
  is_main?: boolean;
}

interface UseClanDataReturn {
  clan: Clan | null;
  characters: CharacterWithProfessions[];
  loading: boolean;
  error: string | null;
  // Actions
  addCharacter: (data: CharacterData) => Promise<void>;
  updateCharacter: (id: string, data: Partial<CharacterData>) => Promise<void>;
  deleteCharacter: (id: string) => Promise<void>;
  setProfessionRank: (characterId: string, professionId: string, rank: RankLevel | null) => Promise<void>;
  refresh: () => Promise<void>;
  // Legacy aliases
  members: CharacterWithProfessions[];
  addMember: (name: string) => Promise<void>;
  updateMember: (id: string, name: string) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
}

export function useClanData(clanSlug: string): UseClanDataReturn {
  const [clan, setClan] = useState<Clan | null>(null);
  const [characters, setCharacters] = useState<CharacterWithProfessions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch clan (no longer auto-creates - that's handled by UI)
  const fetchClan = useCallback(async (): Promise<Clan | null> => {
    try {
      const { data: existingClan, error: fetchError } = await supabase
        .from('clans')
        .select('*')
        .eq('slug', clanSlug)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      return existingClan as Clan | null;
    } catch (err) {
      console.error('Error fetching clan:', err);
      setError(err instanceof Error ? err.message : 'Failed to load clan');
      return null;
    }
  }, [clanSlug]);

  // Fetch all data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const clanData = await fetchClan();
      if (!clanData) {
        setLoading(false);
        return;
      }

      setClan(clanData);

      // Fetch characters with their professions
      const { data: charactersData, error: charactersError } = await supabase
        .from('members')
        .select(`
          *,
          member_professions (*)
        `)
        .eq('clan_id', clanData.id)
        .order('is_main', { ascending: false })
        .order('name');

      if (charactersError) throw charactersError;

      const charactersWithProfessions: CharacterWithProfessions[] = (charactersData || []).map((char) => ({
        ...char,
        // Ensure defaults for new fields
        race: char.race || null,
        primary_archetype: char.primary_archetype || null,
        secondary_archetype: char.secondary_archetype || null,
        level: char.level || 1,
        is_main: char.is_main || false,
        professions: char.member_professions || [],
      }));

      setCharacters(charactersWithProfessions);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [fetchClan]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Add character with full data
  const addCharacter = async (data: CharacterData) => {
    if (!clan) return;

    // If setting as main, first unmark any other main characters for this user
    if (data.is_main) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('members')
          .update({ is_main: false })
          .eq('clan_id', clan.id)
          .eq('user_id', user.id)
          .eq('is_main', true);
      }
    }

    const { error: insertError } = await supabase
      .from('members')
      .insert({ 
        clan_id: clan.id, 
        name: data.name,
        race: data.race || null,
        primary_archetype: data.primary_archetype || null,
        secondary_archetype: data.secondary_archetype || null,
        level: data.level || 1,
        is_main: data.is_main || false,
      })
      .select();

    if (insertError) {
      console.error('Error adding character:', insertError);
      setError(insertError.message);
      throw insertError;
    }

    await fetchData();
  };

  // Update character
  const updateCharacter = async (id: string, data: Partial<CharacterData>) => {
    // If setting as main, first unmark any other main characters for this user
    if (data.is_main === true) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('members')
          .update({ is_main: false })
          .eq('clan_id', clan?.id || '')
          .eq('user_id', user.id)
          .eq('is_main', true)
          .neq('id', id); // Don't update the character we're about to update
      }
    }

    const { error: updateError } = await supabase
      .from('members')
      .update(data)
      .eq('id', id)
      .select();

    if (updateError) {
      console.error('Error updating character:', updateError);
      setError(updateError.message);
      throw updateError;
    }

    await fetchData();
  };

  // Delete character
  const deleteCharacter = async (id: string) => {
    const { error: deleteError } = await supabase
      .from('members')
      .delete()
      .eq('id', id)
      .select();

    if (deleteError) {
      console.error('Error deleting character:', deleteError);
      setError(deleteError.message);
      throw deleteError;
    }

    await fetchData();
  };

  // Set profession rank (null to remove) - uses optimistic updates
  const setProfessionRank = async (
    characterId: string,
    professionId: string,
    rank: RankLevel | null
  ) => {
    // Optimistic update - update local state immediately
    setCharacters((prevCharacters) =>
      prevCharacters.map((character) => {
        if (character.id !== characterId) return character;

        let updatedProfessions = [...character.professions];

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
              member_id: characterId,
              profession: professionId,
              rank,
            });
          }
        }

        return { ...character, professions: updatedProfessions };
      })
    );

    // Persist to database in background
    try {
      if (rank === null) {
        const { error: deleteError } = await supabase
          .from('member_professions')
          .delete()
          .eq('member_id', characterId)
          .eq('profession', professionId)
          .select();

        if (deleteError) throw deleteError;
      } else {
        const { error: upsertError } = await supabase
          .from('member_professions')
          .upsert(
            { member_id: characterId, profession: professionId, rank },
            { onConflict: 'member_id,profession' }
          )
          .select();

        if (upsertError) throw upsertError;
      }
    } catch (err) {
      console.error('Error setting profession rank:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profession');
      // Revert on error by refetching
      await fetchData();
    }
  };

  // Legacy aliases for backward compatibility
  const addMember = async (name: string) => addCharacter({ name });
  const updateMember = async (id: string, name: string) => updateCharacter(id, { name });
  const deleteMember = deleteCharacter;

  return {
    clan,
    characters,
    loading,
    error,
    addCharacter,
    updateCharacter,
    deleteCharacter,
    setProfessionRank,
    refresh: fetchData,
    // Legacy aliases
    members: characters,
    addMember,
    updateMember,
    deleteMember,
  };
}
