
import { generateNumericPart } from './generators';

export const cleanClientCode = (code: string): string => {
  return code.replace(/\s/g, '').toUpperCase();
};

export const formatClientCode = (code: string): string => {
  code = cleanClientCode(code);
  
  // Handle legacy SFD-****** format
  if (code.startsWith('SFD-')) {
    const parts = code.split('-');
    if (parts.length >= 2) {
      const identifier = parts[1];
      const numeric = parts[2] || generateNumericPart();
      return `MEREF-SFD-${identifier}-${numeric}`;
    }
  }
  
  // Add MEREF-SFD prefix if missing
  if (!code.startsWith('MEREF-SFD')) {
    code = 'MEREF-SFD-' + code;
  }
  
  // Format parts correctly
  const parts = code.split('-');
  if (parts.length >= 3) {
    const prefix = parts[0];
    const sfd = parts[1];
    const identifier = parts[2].slice(0, 6);
    const numeric = parts[3] || generateNumericPart();
    return `${prefix}-${sfd}-${identifier}-${numeric}`;
  }
  
  return code;
};
