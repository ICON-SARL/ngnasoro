
/**
 * Safely access string properties with fallback
 */
export function asString(value: any, fallback: string = ''): string {
  if (value === undefined || value === null) {
    return fallback;
  }
  return String(value);
}
