import { useCallback } from 'react';

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'error';

export const useHapticFeedback = () => {
  const vibrate = useCallback((pattern: number | number[]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  const trigger = useCallback((type: HapticType = 'light') => {
    const patterns = {
      light: 10,
      medium: 20,
      heavy: 30,
      success: [10, 50, 10],
      error: [20, 100, 20, 100, 20],
    };

    vibrate(patterns[type]);
  }, [vibrate]);

  return { trigger, vibrate };
};
