
/**
 * Functions for validating client codes
 */

const VALID_FORMATS = [
  /^MEREF-SFD-[A-Z0-9]{6}-\d{4}$/, // New format with hyphen
  /^MEREF-SFD[A-Z0-9]{6}-\d{4}$/,  // New format without hyphen
  /^SFD-[A-Z0-9]{6}-\d{4}$/        // Legacy format
];

export const validateClientCode = (code: string): boolean => {
  // Clean the code first
  code = code.replace(/\s/g, '').toUpperCase();
  
  // Check against all valid formats
  return VALID_FORMATS.some(format => format.test(code));
};
