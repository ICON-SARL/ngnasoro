
/**
 * Functions for formatting and cleaning client codes
 */
export const cleanClientCode = (code: string): string => {
  // Remove spaces and convert to uppercase
  return code.replace(/\s/g, '').toUpperCase();
};

export const formatClientCode = (code: string): string => {
  code = cleanClientCode(code);
  
  // Handle legacy SFD-****** format
  if (code.startsWith('SFD-')) {
    const parts = code.split('-');
    if (parts.length >= 2) {
      const identifier = parts[1];
      return `MEREF-SFD-${identifier}${parts[2] || ''}`
        .replace(/^(MEREF-SFD-[A-Z0-9]{6})(.*)$/, '$1-')
        + (parts[2] || generateNumericPart());
    }
  }
  
  // Add MEREF-SFD prefix if missing
  if (!code.startsWith('MEREF-SFD')) {
    code = 'MEREF-SFD-' + code;
  } else if (!code.includes('-', 9)) {
    // Add hyphen after SFD if missing
    code = code.replace('MEREF-SFD', 'MEREF-SFD-');
  }
  
  // Format parts correctly
  const parts = code.split('-');
  if (parts.length === 3 && parts[2].length >= 6) {
    code = `${parts[0]}-${parts[1]}-${parts[2].slice(0, 6)}-${parts[2].slice(6) || generateNumericPart()}`;
  }
  
  // Add numeric part if missing
  if (!code.endsWith('-' + generateNumericPart())) {
    code += '-' + generateNumericPart();
  }
  
  return code;
};
