/**
 * Tests for utility functions
 */

import { cn } from '../utils';

describe('Utility Functions', () => {
  describe('cn (className combiner)', () => {
    it('should combine multiple class names', () => {
      const result = cn('class1', 'class2', 'class3');
      expect(result).toBe('class1 class2 class3');
    });

    it('should filter out falsy values', () => {
      const result = cn('class1', undefined, 'class2', null, 'class3', false);
      expect(result).toBe('class1 class2 class3');
    });

    it('should return empty string when no valid classes provided', () => {
      const result = cn(undefined, null, false);
      expect(result).toBe('');
    });

    it('should handle single class name', () => {
      const result = cn('single-class');
      expect(result).toBe('single-class');
    });

    it('should handle conditional classes', () => {
      const isActive = true;
      const isDisabled = false;
      const result = cn(
        'base-class',
        isActive && 'active',
        isDisabled && 'disabled'
      );
      expect(result).toBe('base-class active');
    });

    it('should handle empty string values', () => {
      const result = cn('class1', '', 'class2');
      expect(result).toBe('class1 class2');
    });

    it('should work with no arguments', () => {
      const result = cn();
      expect(result).toBe('');
    });

    it('should handle complex conditional scenarios', () => {
      const size: string = 'large'; // Type as string to allow comparisons
      const variant: string = 'primary';
      const isLoading = true;
      const isDisabled = false;

      const result = cn(
        'btn',
        size === 'large' && 'btn-lg',
        size === 'small' && 'btn-sm',
        variant === 'primary' && 'btn-primary',
        isLoading && 'loading',
        isDisabled && 'disabled'
      );

      expect(result).toBe('btn btn-lg btn-primary loading');
    });
  });
});







