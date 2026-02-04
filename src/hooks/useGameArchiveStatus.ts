import { useEffect, useState } from 'react';
import { useGroupData } from './useGroupData';
import { isGameArchived } from '@/lib/group-games';

/**
 * Hook to check if the current game is archived
 * Returns the archived status and loading state
 */
export function useGameArchiveStatus(groupSlug: string, gameSlug: string) {
  const { group } = useGroupData(groupSlug, gameSlug);
  const [isArchived, setIsArchived] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkArchived() {
      if (!group?.id) {
        setLoading(false);
        return;
      }

      try {
        const archived = await isGameArchived(group.id, gameSlug);
        setIsArchived(archived);
      } catch (error) {
        console.error('Error checking game archive status:', error);
        setIsArchived(false);
      } finally {
        setLoading(false);
      }
    }

    checkArchived();
  }, [group?.id, gameSlug]);

  return { isArchived, loading };
}
