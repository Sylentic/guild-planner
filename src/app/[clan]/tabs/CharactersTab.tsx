"use client";
import { AddCharacterButton } from "@/components/AddCharacterButton";
import { CharacterFiltersBar, filterCharacters, DEFAULT_FILTERS } from "@/components/CharacterFilters";
import { CharacterCard } from "@/components/MemberCard";
import { useClanMembership } from '@/hooks/useClanMembership';
import { useAuthContext } from '@/components/AuthProvider';
import { roleHasPermission } from '@/lib/permissions';
import { CharacterWithProfessions } from "@/lib/types";
import { useState } from "react";

interface CharactersTabProps {
  characters: CharacterWithProfessions[];
  addCharacter: (data: any) => Promise<void>;
  setEditingCharacter: (character: CharacterWithProfessions) => void;
  characterFilters: any;
  setCharacterFilters: (filters: any) => void;
}

export function CharactersTab({
  characters,
  addCharacter,
  setEditingCharacter,
  characterFilters,
  setCharacterFilters,
}: CharactersTabProps) {
  const { user } = useAuthContext();
  const clanMembership = useClanMembership(null, user?.id || null);
  console.log('[DEBUG] clanMembership:', clanMembership);
  const userRole = clanMembership.membership?.role || 'pending';
  console.log('[DEBUG] userRole from membership:', userRole);

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
          // Always log debug info for permissions
          console.log('[DEBUG] userRole:', userRole, 'isAdmin:', isAdmin, 'userId:', user?.id, 'charUserId:', character.user_id);
          // Force canEdit for admin for debugging
          const canEdit = isAdmin ? true : (
            (user?.id && character.user_id === user.id && roleHasPermission(userRole, 'characters_edit_own'))
            || roleHasPermission(userRole, 'characters_edit_any')
          );
          console.log('[DEBUG] canEdit:', canEdit, 'readOnly:', !canEdit, 'character:', character.name);
          return (
            <CharacterCard
              key={character.id}
              character={character}
              onUpdate={async () => {}}
              onDelete={async () => {}}
              onSetProfessionRank={async () => {}}
              onEdit={canEdit ? () => setEditingCharacter(character) : undefined}
              readOnly={!canEdit}
            />
          );
        })
      )}
    </div>
  );
}
