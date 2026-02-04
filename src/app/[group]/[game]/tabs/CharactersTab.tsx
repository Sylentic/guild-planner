"use client";
import { AddCharacterButton } from "@/components/characters/AddCharacterButton";
import { CharacterFiltersBar, filterCharacters, DEFAULT_FILTERS } from "@/components/characters/CharacterFilters";
import { CharacterCard } from "@/components/characters/MemberCard";
import { useGroupMembership } from '@/hooks/useGroupMembership';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { roleHasPermission, GroupRole } from '@/lib/permissions';
import { canEditCharacter, canDeleteCharacter, canOfficerManageUser } from '@/lib/character-permissions';
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
  gameSlug?: string;
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
  gameSlug = 'aoc',
}: CharactersTabProps) {
  const { user } = useAuthContext();
  const clanMembership = useGroupMembership(groupId, user?.id || null);
  const userRole = clanMembership.membership?.role || 'pending';

  // Helper to check if user can edit a specific character
  const getUserCanEditCharacter = (character: CharacterWithProfessions): boolean => {
    if (!user) return false;

    // First check basic permission
    if (!canEditCharacter(userRole as GroupRole, character.user_id, user.id)) {
      return false;
    }

    // If officer editing another user's character, check that target user is a member
    if (userRole === 'officer' && character.user_id !== user.id) {
      const targetCharacters = characters.filter(c => c.user_id === character.user_id);
      const targetUser = clanMembership.members.find(m => m.id === character.user_id);
      
      if (targetUser && !canOfficerManageUser(userRole as GroupRole, targetUser.role as GroupRole)) {
        return false;
      }
    }

    return true;
  };

  // Helper to check if user can delete a specific character
  const getUserCanDeleteCharacter = (character: CharacterWithProfessions): boolean => {
    if (!user) return false;

    // First check basic permission
    if (!canDeleteCharacter(userRole as GroupRole, character.user_id, user.id)) {
      return false;
    }

    // If officer deleting another user's character, check that target user is a member
    if (userRole === 'officer' && character.user_id !== user.id) {
      const targetUser = clanMembership.members.find(m => m.id === character.user_id);
      
      if (targetUser && !canOfficerManageUser(userRole as GroupRole, targetUser.role as GroupRole)) {
        return false;
      }
    }

    return true;
  };

  // Stub function for disabled update
  const handleUpdateStub = async (id: string, name: string) => {
    throw new Error('You do not have permission to edit this character');
  };

  // Stub function for disabled delete
  const handleDeleteStub = async (id: string) => {
    throw new Error('You do not have permission to delete this character');
  };

  return (
    <div className="space-y-4">
      <AddCharacterButton onAdd={addCharacter} gameSlug={gameSlug} />
      {characters.length > 0 && (
        <CharacterFiltersBar
          filters={characterFilters}
          onChange={setCharacterFilters}
          characterCount={characters.length}
          filteredCount={filterCharacters(characters, characterFilters).length}
          gameSlug={gameSlug}
        />
      )}
      {characters.length === 0 ? (
        <div className="text-slate-400 text-center py-8">No characters found.</div>
      ) : filterCharacters(characters, characterFilters).length === 0 ? (
        <div className="text-slate-400 text-center py-8">No characters match the filters.</div>
      ) : (
        filterCharacters(characters, characterFilters).map((character) => {
          // Check if user can edit this character
          const canEdit = getUserCanEditCharacter(character);
          const canDelete = getUserCanDeleteCharacter(character);
          
          // Get main character name if this is an alt
          const mainCharacter = character.is_main ? null : characters.find(c => c.user_id === character.user_id && c.is_main);
          // Get alt characters if this is a main
          const alts = character.is_main ? characters.filter(c => c.user_id === character.user_id && !c.is_main) : [];
          
          return (
            <CharacterCard
              key={character.id}
              character={character}
              onUpdate={canEdit ? updateMember : handleUpdateStub}
              onDelete={canDelete ? deleteMember : handleDeleteStub}
              onSetProfessionRank={setProfessionRank}
              onEdit={canEdit ? () => setEditingCharacter(character) : undefined}
              readOnly={!canEdit}
              mainCharacterName={mainCharacter?.name}
              altCharacters={alts}
              gameSlug={gameSlug}
            />
          );
        })
      )}
    </div>
  );
}

