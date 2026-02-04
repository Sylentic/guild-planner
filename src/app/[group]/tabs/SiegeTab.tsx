import { SiegeTabContent } from '@/components/views/SiegeTabContent';
import { CharacterWithProfessions } from '@/lib/types';

export interface SiegeTabProps {
  groupId: string;
  characters: CharacterWithProfessions[];
  userId: string;
}

export function SiegeTab({ groupId, characters, userId }: SiegeTabProps) {
  return (
    <SiegeTabContent
      groupId={groupId}
      characters={characters}
      userId={userId}
    />
  );
}

