
/**
 * Functions for generating client codes and their parts
 */
export const generateNumericPart = (): string => {
  return Array(4)
    .fill(0)
    .map(() => Math.floor(Math.random() * 10))
    .join('');
};

export const generateClientCode = (): string => {
  // Generate 6 random alphanumeric characters (uppercase)
  const alphanumericPart = Array(6)
    .fill(0)
    .map(() => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      return chars.charAt(Math.floor(Math.random() * chars.length));
    })
    .join('');

  const numericPart = generateNumericPart();
  
  return `MEREF-SFD-${alphanumericPart}-${numericPart}`;
};
