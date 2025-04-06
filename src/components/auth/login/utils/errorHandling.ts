
// Function to extract cooldown time from error messages
export const extractCooldownTime = (errorMessage: string): number => {
  try {
    const regex = /(\d+) second/;
    const match = errorMessage.match(regex);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
    return 30; // Default cooldown time if we can't extract it
  } catch (e) {
    console.error("Error extracting cooldown time:", e);
    return 30; // Default fallback
  }
};

// Add any other error handling utils here
