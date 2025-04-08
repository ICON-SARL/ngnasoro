
/**
 * Generates a secure random password
 * @param length Length of the password (default: 12)
 * @returns A secure random password
 */
export function generateSecurePassword(length: number = 12): string {
  const lowerChars = 'abcdefghijklmnopqrstuvwxyz';
  const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const specialChars = '!@#$%^&*()_-+=<>?';
  const allChars = lowerChars + upperChars + numbers + specialChars;
  
  // Ensure at least one of each type
  let password = 
    lowerChars[Math.floor(Math.random() * lowerChars.length)] +
    upperChars[Math.floor(Math.random() * upperChars.length)] +
    numbers[Math.floor(Math.random() * numbers.length)] +
    specialChars[Math.floor(Math.random() * specialChars.length)];
  
  // Fill the rest with random characters
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password (Fisher-Yates algorithm)
  const passwordArray = password.split('');
  for (let i = passwordArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
  }
  
  return passwordArray.join('');
}

/**
 * Validates password strength
 * @param password Password to validate
 * @returns Object containing validation result and strength score
 */
export function validatePassword(password: string): { 
  isValid: boolean; 
  score: number; 
  feedback: string[] 
} {
  const feedback: string[] = [];
  let score = 0;
  
  // Length check
  if (password.length < 8) {
    feedback.push('Le mot de passe doit contenir au moins 8 caractères');
  } else {
    score += 25;
  }
  
  // Contains lowercase letters
  if (!/[a-z]/.test(password)) {
    feedback.push('Le mot de passe doit contenir au moins une lettre minuscule');
  } else {
    score += 25;
  }
  
  // Contains uppercase letters
  if (!/[A-Z]/.test(password)) {
    feedback.push('Le mot de passe doit contenir au moins une lettre majuscule');
  } else {
    score += 25;
  }
  
  // Contains numbers or special characters
  if (!/[0-9!@#$%^&*()_\-+=<>?]/.test(password)) {
    feedback.push('Le mot de passe doit contenir au moins un chiffre ou caractère spécial');
  } else {
    score += 25;
  }
  
  return {
    isValid: feedback.length === 0,
    score,
    feedback
  };
}
