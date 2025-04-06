
export const extractCooldownTime = (errorMessage: string): number => {
  const match = errorMessage.match(/after (\d+) seconds/);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  return 60; // Default cooldown
};
