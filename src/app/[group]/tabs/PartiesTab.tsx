import { useParties } from '@/hooks/useParties';
import { PartiesList } from '@/components/PartiesList';
import { CharacterWithProfessions } from '@/lib/types';

export interface PartiesTabProps {
  groupId: string;
  characters: CharacterWithProfessions[];
  userId: string;
  canManage: boolean;
}

export function PartiesTab({ groupId, characters, userId, canManage }: PartiesTabProps) {
  const {
    parties,
    createParty,
    updateParty,
    deleteParty,
    assignCharacter,
    removeFromRoster,
    toggleConfirmed,
  } = useParties(groupId, characters);

  return (
    <PartiesList
      parties={parties}
      characters={characters}
      groupId={groupId}
      userId={userId}
      canManage={canManage}
      onCreateParty={createParty}
      onUpdateParty={updateParty}
      onDeleteParty={deleteParty}
      onAssignCharacter={assignCharacter}
      onRemoveFromRoster={removeFromRoster}
      onToggleConfirmed={toggleConfirmed}
    />
  );
}

