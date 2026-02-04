'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Party, PartyWithRoster, PartyRoster, PartyRole, CharacterWithProfessions } from '@/lib/types';

interface UsePartiesReturn {
  parties: PartyWithRoster[];
  loading: boolean;
  error: string | null;
  // Party CRUD
  createParty: (party: Omit<Party, 'id' | 'created_at' | 'updated_at'>) => Promise<Party | null>;
  updateParty: (id: string, updates: Partial<Party>) => Promise<void>;
  deleteParty: (id: string) => Promise<void>;
  // Roster management
  assignCharacter: (partyId: string, characterId: string, role: PartyRole) => Promise<void>;
  removeFromRoster: (partyId: string, characterId: string) => Promise<void>;
  updateRosterRole: (partyId: string, characterId: string, role: PartyRole) => Promise<void>;
  toggleConfirmed: (partyId: string, characterId: string, confirmed: boolean) => Promise<void>;
  // Utils
  refresh: () => Promise<void>;
}

export function useParties(
  groupId: string | null,
  characters: CharacterWithProfessions[]
): UsePartiesReturn {
  const [parties, setParties] = useState<PartyWithRoster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch parties with roster
  const fetchParties = useCallback(async () => {
    if (!groupId) return;

    try {
      const { data: partiesData, error: partiesError } = await supabase
        .from('parties')
        .select(`
          *,
          party_roster (*)
        `)
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      if (partiesError) throw partiesError;

      // Enrich roster with character data
      const enrichedParties: PartyWithRoster[] = (partiesData || []).map(party => {
        const roster = (party.party_roster || []).map((r: PartyRoster) => {
          const character = characters.find(c => c.id === r.character_id);
          return { ...r, character };
        });
        return { ...party, roster };
      });

      setParties(enrichedParties);
    } catch (err) {
      console.error('Error fetching parties:', err);
      setError(err instanceof Error ? err.message : 'Failed to load parties');
    }
  }, [groupId, characters]);

  // Initial fetch
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchParties();
      setLoading(false);
    };
    if (groupId) load();
  }, [groupId, fetchParties]);

  // Create party
  const createParty = async (
    party: Omit<Party, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Party | null> => {
    const { data, error: createError } = await supabase
      .from('parties')
      .insert(party)
      .select()
      .single();

    if (createError) {
      setError(createError.message);
      throw createError;
    }

    await fetchParties();
    return data;
  };

  // Update party
  const updateParty = async (id: string, updates: Partial<Party>) => {
    const { error: updateError } = await supabase
      .from('parties')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select();

    if (updateError) {
      setError(updateError.message);
      throw updateError;
    }

    await fetchParties();
  };

  // Delete party
  const deleteParty = async (id: string) => {
    const { error: deleteError } = await supabase
      .from('parties')
      .delete()
      .eq('id', id)
      .select();

    if (deleteError) {
      setError(deleteError.message);
      throw deleteError;
    }

    setParties(prev => prev.filter(p => p.id !== id));
  };

  // Assign character to party
  const assignCharacter = async (
    partyId: string,
    characterId: string,
    role: PartyRole
  ) => {
    const { error: assignError } = await supabase
      .from('party_roster')
      .upsert({
        party_id: partyId,
        character_id: characterId,
        role,
        assigned_at: new Date().toISOString(),
      }, {
        onConflict: 'party_id,character_id'
      })
      .select();

    if (assignError) {
      setError(assignError.message);
      throw assignError;
    }

    await fetchParties();
  };

  // Remove from roster
  const removeFromRoster = async (partyId: string, characterId: string) => {
    const { error: removeError } = await supabase
      .from('party_roster')
      .delete()
      .eq('party_id', partyId)
      .eq('character_id', characterId)
      .select();

    if (removeError) {
      setError(removeError.message);
      throw removeError;
    }

    // Optimistic update
    setParties(prev => prev.map(p => {
      if (p.id !== partyId) return p;
      return {
        ...p,
        roster: p.roster.filter(r => r.character_id !== characterId)
      };
    }));
  };

  // Update roster role
  const updateRosterRole = async (
    partyId: string,
    characterId: string,
    role: PartyRole
  ) => {
    const { error: updateError } = await supabase
      .from('party_roster')
      .update({ role })
      .eq('party_id', partyId)
      .eq('character_id', characterId)
      .select();

    if (updateError) {
      setError(updateError.message);
      throw updateError;
    }

    // Optimistic update
    setParties(prev => prev.map(p => {
      if (p.id !== partyId) return p;
      return {
        ...p,
        roster: p.roster.map(r => 
          r.character_id === characterId ? { ...r, role } : r
        )
      };
    }));
  };

  // Toggle confirmed status
  const toggleConfirmed = async (
    partyId: string,
    characterId: string,
    confirmed: boolean
  ) => {
    const { error: updateError } = await supabase
      .from('party_roster')
      .update({ is_confirmed: confirmed })
      .eq('party_id', partyId)
      .eq('character_id', characterId)
      .select();

    if (updateError) {
      setError(updateError.message);
      throw updateError;
    }

    // Optimistic update
    setParties(prev => prev.map(p => {
      if (p.id !== partyId) return p;
      return {
        ...p,
        roster: p.roster.map(r => 
          r.character_id === characterId ? { ...r, is_confirmed: confirmed } : r
        )
      };
    }));
  };

  return {
    parties,
    loading,
    error,
    createParty,
    updateParty,
    deleteParty,
    assignCharacter,
    removeFromRoster,
    updateRosterRole,
    toggleConfirmed,
    refresh: fetchParties,
  };
}

