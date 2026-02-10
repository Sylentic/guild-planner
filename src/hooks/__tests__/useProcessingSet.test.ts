/**
 * Phase 2 Tests: useProcessingSet Hook - Sprint 11
 * Tests for processing state management utility hook
 */

import { act, renderHook } from '@testing-library/react';
import { useProcessingSet } from '../useProcessingSet';

describe('useProcessingSet Hook - Phase 2 Sprint 11', () => {
  describe('Hook Initialization', () => {
    it('initializes with empty processing set', () => {
      const { result } = renderHook(() => useProcessingSet());

      expect(result.current.processing).toBeInstanceOf(Set);
      expect(result.current.processing.size).toBe(0);
      expect(typeof result.current.add).toBe('function');
      expect(typeof result.current.remove).toBe('function');
      expect(typeof result.current.has).toBe('function');
      expect(typeof result.current.clear).toBe('function');
    });

    it('exposes all required API methods', () => {
      const { result } = renderHook(() => useProcessingSet());

      expect(result.current).toHaveProperty('processing');
      expect(result.current).toHaveProperty('add');
      expect(result.current).toHaveProperty('remove');
      expect(result.current).toHaveProperty('has');
      expect(result.current).toHaveProperty('clear');
    });
  });

  describe('Adding IDs', () => {
    it('adds a single ID to the processing set', () => {
      const { result } = renderHook(() => useProcessingSet());

      act(() => {
        result.current.add('id-1');
      });

      expect(result.current.processing.has('id-1')).toBe(true);
      expect(result.current.processing.size).toBe(1);
    });

    it('adds multiple IDs to the processing set', () => {
      const { result } = renderHook(() => useProcessingSet());

      act(() => {
        result.current.add('id-1');
        result.current.add('id-2');
        result.current.add('id-3');
      });

      expect(result.current.processing.size).toBe(3);
      expect(result.current.processing.has('id-1')).toBe(true);
      expect(result.current.processing.has('id-2')).toBe(true);
      expect(result.current.processing.has('id-3')).toBe(true);
    });

    it('handles duplicate additions gracefully', () => {
      const { result } = renderHook(() => useProcessingSet());

      act(() => {
        result.current.add('id-1');
        result.current.add('id-1');
        result.current.add('id-1');
      });

      // Set should only contain one entry
      expect(result.current.processing.size).toBe(1);
      expect(result.current.processing.has('id-1')).toBe(true);
    });

    it('preserves existing IDs when adding new ones', () => {
      const { result } = renderHook(() => useProcessingSet());

      act(() => {
        result.current.add('id-1');
      });

      expect(result.current.processing.has('id-1')).toBe(true);

      act(() => {
        result.current.add('id-2');
      });

      expect(result.current.processing.has('id-1')).toBe(true);
      expect(result.current.processing.has('id-2')).toBe(true);
      expect(result.current.processing.size).toBe(2);
    });
  });

  describe('Removing IDs', () => {
    it('removes a single ID from the processing set', () => {
      const { result } = renderHook(() => useProcessingSet());

      act(() => {
        result.current.add('id-1');
      });

      expect(result.current.processing.has('id-1')).toBe(true);

      act(() => {
        result.current.remove('id-1');
      });

      expect(result.current.processing.has('id-1')).toBe(false);
      expect(result.current.processing.size).toBe(0);
    });

    it('removes specific ID while preserving others', () => {
      const { result } = renderHook(() => useProcessingSet());

      act(() => {
        result.current.add('id-1');
        result.current.add('id-2');
        result.current.add('id-3');
      });

      act(() => {
        result.current.remove('id-2');
      });

      expect(result.current.processing.has('id-1')).toBe(true);
      expect(result.current.processing.has('id-2')).toBe(false);
      expect(result.current.processing.has('id-3')).toBe(true);
      expect(result.current.processing.size).toBe(2);
    });

    it('handles removing non-existent ID gracefully', () => {
      const { result } = renderHook(() => useProcessingSet());

      act(() => {
        result.current.add('id-1');
      });

      // Remove ID that doesn't exist
      act(() => {
        result.current.remove('id-2');
      });

      expect(result.current.processing.size).toBe(1);
      expect(result.current.processing.has('id-1')).toBe(true);
    });

    it('handles removing from empty set gracefully', () => {
      const { result } = renderHook(() => useProcessingSet());

      act(() => {
        result.current.remove('id-1');
      });

      expect(result.current.processing.size).toBe(0);
    });
  });

  describe('Checking Existence', () => {
    it('returns true when ID exists in set', () => {
      const { result } = renderHook(() => useProcessingSet());

      act(() => {
        result.current.add('id-1');
      });

      expect(result.current.has('id-1')).toBe(true);
    });

    it('returns false when ID does not exist in set', () => {
      const { result } = renderHook(() => useProcessingSet());

      act(() => {
        result.current.add('id-1');
      });

      expect(result.current.has('id-2')).toBe(false);
    });

    it('returns false for empty set', () => {
      const { result } = renderHook(() => useProcessingSet());

      expect(result.current.has('id-1')).toBe(false);
    });

    it('updates immediately after adding ID', () => {
      const { result } = renderHook(() => useProcessingSet());

      expect(result.current.has('id-1')).toBe(false);

      act(() => {
        result.current.add('id-1');
      });

      expect(result.current.has('id-1')).toBe(true);
    });

    it('updates immediately after removing ID', () => {
      const { result } = renderHook(() => useProcessingSet());

      act(() => {
        result.current.add('id-1');
      });

      expect(result.current.has('id-1')).toBe(true);

      act(() => {
        result.current.remove('id-1');
      });

      expect(result.current.has('id-1')).toBe(false);
    });
  });

  describe('Clearing Set', () => {
    it('clears all IDs from the processing set', () => {
      const { result } = renderHook(() => useProcessingSet());

      act(() => {
        result.current.add('id-1');
        result.current.add('id-2');
        result.current.add('id-3');
      });

      expect(result.current.processing.size).toBe(3);

      act(() => {
        result.current.clear();
      });

      expect(result.current.processing.size).toBe(0);
      expect(result.current.has('id-1')).toBe(false);
      expect(result.current.has('id-2')).toBe(false);
      expect(result.current.has('id-3')).toBe(false);
    });

    it('handles clearing empty set gracefully', () => {
      const { result } = renderHook(() => useProcessingSet());

      act(() => {
        result.current.clear();
      });

      expect(result.current.processing.size).toBe(0);
    });

    it('allows adding IDs after clearing', () => {
      const { result } = renderHook(() => useProcessingSet());

      act(() => {
        result.current.add('id-1');
        result.current.add('id-2');
      });

      act(() => {
        result.current.clear();
      });

      expect(result.current.processing.size).toBe(0);

      act(() => {
        result.current.add('id-3');
      });

      expect(result.current.processing.size).toBe(1);
      expect(result.current.has('id-3')).toBe(true);
      expect(result.current.has('id-1')).toBe(false);
    });
  });

  describe('Complex Scenarios', () => {
    it('handles rapid add/remove cycles', () => {
      const { result } = renderHook(() => useProcessingSet());

      act(() => {
        result.current.add('id-1');
        result.current.remove('id-1');
        result.current.add('id-1');
        result.current.add('id-2');
        result.current.remove('id-2');
      });

      expect(result.current.processing.size).toBe(1);
      expect(result.current.has('id-1')).toBe(true);
      expect(result.current.has('id-2')).toBe(false);
    });

    it('manages async operation simulation', () => {
      const { result } = renderHook(() => useProcessingSet());

      const ids = ['op-1', 'op-2', 'op-3', 'op-4', 'op-5'];

      // Start all operations
      act(() => {
        ids.forEach(id => result.current.add(id));
      });

      expect(result.current.processing.size).toBe(5);

      // Complete operations 1 and 3
      act(() => {
        result.current.remove('op-1');
        result.current.remove('op-3');
      });

      expect(result.current.processing.size).toBe(3);
      expect(result.current.has('op-1')).toBe(false);
      expect(result.current.has('op-2')).toBe(true);
      expect(result.current.has('op-3')).toBe(false);
      expect(result.current.has('op-4')).toBe(true);
      expect(result.current.has('op-5')).toBe(true);

      // Complete remaining operations
      act(() => {
        result.current.remove('op-2');
        result.current.remove('op-4');
        result.current.remove('op-5');
      });

      expect(result.current.processing.size).toBe(0);
    });

    it('handles different ID formats', () => {
      const { result } = renderHook(() => useProcessingSet());

      act(() => {
        result.current.add('user-123');
        result.current.add('8a7b9c');
        result.current.add('operation_456');
        result.current.add('UUID-4f3e-2d1c');
      });

      expect(result.current.processing.size).toBe(4);
      expect(result.current.has('user-123')).toBe(true);
      expect(result.current.has('8a7b9c')).toBe(true);
      expect(result.current.has('operation_456')).toBe(true);
      expect(result.current.has('UUID-4f3e-2d1c')).toBe(true);
    });

    it('maintains state across multiple hook returns', () => {
      const { result } = renderHook(() => useProcessingSet());

      act(() => {
        result.current.add('id-1');
      });

      const firstAdd = result.current.add;

      act(() => {
        result.current.add('id-2');
      });

      const secondAdd = result.current.add;

      // Functions should be stable (useCallback)
      expect(firstAdd).toBe(secondAdd);
      expect(result.current.processing.size).toBe(2);
    });
  });

  describe('Callback Stability', () => {
    it('maintains stable function references across renders', () => {
      const { result, rerender } = renderHook(() => useProcessingSet());

      const initialAdd = result.current.add;
      const initialRemove = result.current.remove;
      const initialClear = result.current.clear;

      rerender();

      expect(result.current.add).toBe(initialAdd);
      expect(result.current.remove).toBe(initialRemove);
      expect(result.current.clear).toBe(initialClear);
    });

    it('has function updates when processing state changes', () => {
      const { result } = renderHook(() => useProcessingSet());

      const initialHas = result.current.has;

     act(() => {
        result.current.add('id-1');
      });

      // has() depends on processing, so it may not be stable
      // but it should still work correctly
      expect(result.current.has('id-1')).toBe(true);
    });
  });
});
