import { useState, useCallback } from 'react';

/**
 * Custom hook to manage a Set of IDs being processed (loading states)
 * Useful for managing multiple async operations with individual loading states
 * 
 * @example
 * const { processing, add, remove, has, clear } = useProcessingSet();
 * 
 * // Start processing
 * add('user-123');
 * 
 * // Check if processing
 * if (has('user-123')) { ... }
 * 
 * // Stop processing
 * remove('user-123');
 */
export function useProcessingSet() {
  const [processing, setProcessing] = useState<Set<string>>(new Set());

  const add = useCallback((id: string) => {
    setProcessing(prev => new Set(prev).add(id));
  }, []);

  const remove = useCallback((id: string) => {
    setProcessing(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const has = useCallback((id: string) => processing.has(id), [processing]);

  const clear = useCallback(() => {
    setProcessing(new Set());
  }, []);

  return { processing, add, remove, has, clear };
}
