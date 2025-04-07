
/**
 * Safely access nested properties in potentially undefined objects
 * @param obj The object to access properties from
 * @param key The property key to access
 * @param defaultValue Value to return if property doesn't exist
 */
export function safeGet<T, K extends keyof T>(obj: T | null | undefined, key: K, defaultValue: T[K]): T[K] {
  if (!obj || typeof obj !== 'object') return defaultValue;
  return (obj[key] !== undefined && obj[key] !== null) ? obj[key] : defaultValue;
}

/**
 * Safely access nested object properties in arrays
 * @param item The object with nested properties
 * @param nestedKey The nested object key
 * @param propertyKey The property key in the nested object
 * @param defaultValue Value to return if property doesn't exist
 */
export function safeGetNested<T extends Record<string, any>>(
  item: T, 
  nestedKey: string, 
  propertyKey: string,
  defaultValue: any
): any {
  if (!item || typeof item !== 'object') return defaultValue;
  
  const nestedObj = item[nestedKey];
  if (!nestedObj || typeof nestedObj !== 'object') return defaultValue;
  
  return (nestedObj[propertyKey] !== undefined && nestedObj[propertyKey] !== null) 
    ? nestedObj[propertyKey] 
    : defaultValue;
}

/**
 * Type-safe conversion from unknown to string
 */
export function asString(value: unknown, defaultValue: string = ''): string {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return defaultValue;
  return String(value);
}
