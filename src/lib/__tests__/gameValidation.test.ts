/**
 * Tests for game validation functions
 */

import { validateClanGame, getClanGame } from '../gameValidation';
import type { GameId } from '../games';
import { supabase } from '../supabase';

// Mock Supabase
jest.mock('../supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
    })),
  },
}));

describe('Game Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateClanGame', () => {
    it('should return true when clan game matches expected game', async () => {
      const mockSingle = jest.fn().mockResolvedValue({
        data: { game: 'aoc' },
        error: null,
      });

      jest.mocked(supabase).from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: mockSingle,
          }),
        }),
      });

      const result = await validateClanGame('test-group-id', 'aoc' as GameId);
      expect(result).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith('groups');
    });

    it('should return false when clan game does not match expected game', async () => {
      const mockSingle = jest.fn().mockResolvedValue({
        data: { game: 'starcitizen' },
        error: null,
      });

      jest.mocked(supabase).from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: mockSingle,
          }),
        }),
      });

      const result = await validateClanGame('test-group-id', 'aoc' as GameId);
      expect(result).toBe(false);
    });

    it('should return false on database error', async () => {
      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: new Error('Database error'),
      });

      jest.mocked(supabase).from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: mockSingle,
          }),
        }),
      });

      const result = await validateClanGame('test-group-id', 'aoc' as GameId);
      expect(result).toBe(false);
    });

    it('should return false when no data found', async () => {
      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      jest.mocked(supabase).from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: mockSingle,
          }),
        }),
      });

      const result = await validateClanGame('nonexistent-group', 'aoc' as GameId);
      expect(result).toBe(false);
    });
  });

  describe('getClanGame', () => {
    it('should return game ID when clan exists', async () => {
      const mockSingle = jest.fn().mockResolvedValue({
        data: { game: 'starcitizen' },
        error: null,
      });

      jest.mocked(supabase).from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: mockSingle,
          }),
        }),
      });

      const result = await getClanGame('test-group-id');
      expect(result).toBe('starcitizen');
    });

    it('should return null on error', async () => {
      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: new Error('Not found'),
      });

      jest.mocked(supabase).from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: mockSingle,
          }),
        }),
      });

      const result = await getClanGame('nonexistent-group');
      expect(result).toBeNull();
    });

    it('should return null when no data found', async () => {
      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      jest.mocked(supabase).from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: mockSingle,
          }),
        }),
      });

      const result = await getClanGame('test-group-id');
      expect(result).toBeNull();
    });
  });
});
