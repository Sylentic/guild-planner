'use client';

import { use, useState } from 'react';
import { GameLayout } from '../GameLayout';
import { CharactersTab } from '../tabs/CharactersTab';
import { useGroupData } from '@/hooks/useGroupData';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { CharacterEditModal } from '../CharacterEditModal';
import { CharacterWithProfessions } from '@/lib/types';
import { DEFAULT_FILTERS, CharacterFilters } from '@/components/characters/CharacterFilters';

export default function CharactersPage({ params }: { params: Promise<{ group: string; game: string }> }) {
  const { group: groupSlug, game: gameSlug } = use(params);
  const { user } = useAuthContext();
  const {
    group,
    characters,
    addCharacter,
    updateMember,
    deleteMember,
    updateCharacter,
    setProfessionRank,
  } = useGroupData(groupSlug, gameSlug);
  const [editingCharacter, setEditingCharacter] = useState<CharacterWithProfessions | null>(null);
  const [characterFilters, setCharacterFilters] = useState<CharacterFilters>(DEFAULT_FILTERS);

  if (!group || !user) {
    return <GameLayout params={params} activeTab="characters"><div /></GameLayout>;
  }

  return (
    <GameLayout params={params} activeTab="characters" characterCount={characters.length}>
      <CharactersTab
        groupId={group.id}
        characters={characters}
        addCharacter={addCharacter}
        updateMember={updateMember}
        deleteMember={deleteMember}
        setProfessionRank={setProfessionRank}
        setEditingCharacter={setEditingCharacter}
        characterFilters={characterFilters}
        setCharacterFilters={setCharacterFilters}
        gameSlug={gameSlug}
      />

      <CharacterEditModal
        editingCharacter={editingCharacter}
        onSubmit={async (id, data) => {
          await updateCharacter(id, data);
          setEditingCharacter(null);
        }}
        onCancel={() => setEditingCharacter(null)}
        gameSlug={gameSlug}
      />
    </GameLayout>
  );
}
