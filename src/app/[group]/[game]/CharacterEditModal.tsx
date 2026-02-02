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
      }}
      onSubmit={async (data) => {
        await onSubmit(editingCharacter.id, data);
      }}
      onCancel={onCancel}
      isEditing
    />
  );
}
