/**
 * Simple utility function to combine class names
 * @param classes - Class names to combine (strings or undefined/null values)
 * @returns Combined class string with falsy values filtered out
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

