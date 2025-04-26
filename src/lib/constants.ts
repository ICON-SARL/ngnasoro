
// Phone validation constants and utility functions
export const MALI_PHONE_REGEX = /^(\+223)?[67]\d{7}$/;

export const PHONE_FORMAT_MESSAGE = 'Le numéro de téléphone doit être un numéro malien valide (+223 67 ou 66 XXXXXXX)';

export const MALI_REGIONS = [
  'Bamako',
  'Gao',
  'Kayes',
  'Kidal',
  'Koulikoro',
  'Mopti',
  'Ségou',
  'Sikasso',
  'Taoudénit',
  'Tombouctou'
].sort();

export function normalizeMaliPhoneNumber(phone: string): string {
  // Remove any existing spaces or dashes
  const cleanedPhone = phone.replace(/[\s-]/g, '');
  
  // If the phone doesn't start with +223, add it
  if (!cleanedPhone.startsWith('+223')) {
    const phoneWithoutLeadingZero = cleanedPhone.replace(/^0/, '');
    return `+223${phoneWithoutLeadingZero}`;
  }
  
  return cleanedPhone;
}

export function validateMaliPhoneNumber(phone: string | undefined): boolean {
  if (!phone) return true; // Allow empty/undefined values
  
  const normalizedPhone = normalizeMaliPhoneNumber(phone);
  return MALI_PHONE_REGEX.test(normalizedPhone);
}
