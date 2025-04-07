
export const extractCooldownTime = (errorMessage: string): number => {
  const match = errorMessage.match(/(\d+) seconds/);
  return match ? parseInt(match[1], 10) : 60;
};
