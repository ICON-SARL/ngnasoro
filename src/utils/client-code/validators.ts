
/**
 * Functions for validating client codes
 */

const VALID_FORMATS = [
  /^MEREF-SFD-[A-Z0-9]{6}-\d{4}$/, // Format standard
  /^SFD-[A-Z0-9]{6}-\d{4}$/,       // Format legacy
];

export const validateClientCode = (code: string): boolean => {
  // Clean the code first
  code = code.replace(/\s/g, '').toUpperCase();
  
  // Check against all valid formats
  return VALID_FORMATS.some(format => format.test(code));
};

export const isLegacyFormat = (code: string): boolean => {
  return /^SFD-[A-Z0-9]{6}-\d{4}$/.test(code);
};
