import { CharacterWithProfessions } from '@/lib/types';
import { CharacterForm } from '@/components/CharacterForm';
import React from 'react';

interface CharacterEditModalProps {
  editingCharacter: CharacterWithProfessions | null;
  onSubmit: (id: string, data: any) => Promise<void>;
  onCancel: () => void;
}

export function CharacterEditModal({ editingCharacter, onSubmit, onCancel }: CharacterEditModalProps) {
  if (!editingCharacter) return null;
  return (
    <CharacterForm
      initialData={{
        name: editingCharacter.name,
        race: editingCharacter.race,
        primary_archetype: editingCharacter.primary_archetype,
        secondary_archetype: editingCharacter.secondary_archetype,
        level: editingCharacter.level,
        is_main: editingCharacter.is_main,
        subscriber_tier: (editingCharacter as any)?.subscriber_tier || null,
        subscriber_since: (editingCharacter as any)?.subscriber_since || null,
        subscriber_ships_month: (editingCharacter as any)?.subscriber_ships_month || null,
        ror_faction: (editingCharacter as any)?.ror_faction || null,
        ror_class: (editingCharacter as any)?.ror_class || null,
        preferred_role: (editingCharacter as any)?.preferred_role || null,
        rank: (editingCharacter as any)?.rank || null,
      }}
      onSubmit={async (data) => {
        await onSubmit(editingCharacter.id, data);
      }}
      onCancel={onCancel}
      isEditing
      characterId={editingCharacter.id}
    />
  );
}

