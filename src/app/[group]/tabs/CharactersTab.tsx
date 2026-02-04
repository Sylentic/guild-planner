"use client";
import { AddCharacterButton } from "@/components/AddCharacterButton";
import { CharacterFiltersBar, filterCharacters, DEFAULT_FILTERS } from "@/components/CharacterFilters";
import { CharacterCard } from "@/components/MemberCard";
import { useGroupMembership } from '@/hooks/useGroupMembership';
import { useAuthContext } from '@/components/AuthProvider';
import { roleHasPermission } from '@/lib/permissions';
import { CharacterWithProfessions } from "@/lib/types";
import { useState } from "react";

interface CharactersTabProps {
  groupId: string;
  characters: CharacterWithProfessions[];
  addCharacter: (data: any) => Promise<void>;
  updateMember: (id: string, name: string) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;
  setProfessionRank: (characterId: string, professionId: string, rank: any, level?: number, quality?: number) => Promise<void>;
  setEditingCharacter: (character: CharacterWithProfessions) => void;
  characterFilters: any;
  setCharacterFilters: (filters: any) => void;
}

export function CharactersTab({
  groupId,
  characters,
  addCharacter,
  updateMember,
  deleteMember,
  setProfessionRank,
  setEditingCharacter,
  characterFilters,
  setCharacterFilters,
}: CharactersTabProps) {
  const { user } = useAuthContext();
  const clanMembership = useGroupMembership(groupId, user?.id || null);
  const userRole = clanMembership.membership?.role || 'pending';

  return (
    <div className="space-y-4">
      <AddCharacterButton onAdd={addCharacter} />
      {characters.length > 0 && (
        <CharacterFiltersBar
          filters={characterFilters}
          onChange={setCharacterFilters}
          characterCount={characters.length}
          filteredCount={filterCharacters(characters, characterFilters).length}
        />
      )}
      {characters.length === 0 ? (
        <div className="text-slate-400 text-center py-8">No characters found.</div>
      ) : filterCharacters(characters, characterFilters).length === 0 ? (
        <div className="text-slate-400 text-center py-8">No characters match the filters.</div>
      ) : (
        filterCharacters(characters, characterFilters).map((character) => {
          // Only allow edit if user owns character AND has 'characters_edit_own', or has 'characters_edit_any' permission
          const isAdmin = userRole === 'admin';
          const canEdit = isAdmin ? true : (
            (user?.id && character.user_id === user.id && roleHasPermission(userRole, 'characters_edit_own'))
            || roleHasPermission(userRole, 'characters_edit_any')
          );
          
          // Get main character name if this is an alt
          const mainCharacter = character.is_main ? null : characters.find(c => c.user_id === character.user_id && c.is_main);
          // Get alt characters if this is a main
          const alts = character.is_main ? characters.filter(c => c.user_id === character.user_id && !c.is_main) : [];
          
          return (
            <CharacterCard
              key={character.id}
              character={character}
              onUpdate={updateMember}
              onDelete={deleteMember}
              onSetProfessionRank={setProfessionRank}
              onEdit={canEdit ? () => setEditingCharacter(character) : undefined}
              readOnly={!canEdit}
              mainCharacterName={mainCharacter?.name}
              altCharacters={alts}
            />
          );
        })
      )}
    </div>
  );
}

