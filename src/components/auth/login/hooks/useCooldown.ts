
import { useState, useEffect } from 'react';
import { extractCooldownTime } from '../utils/errorHandling';

export const useCooldown = () => {
  const [cooldownActive, setCooldownActive] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);

  // Handle cooldown timer
  useEffect(() => {
    if (cooldownTime <= 0) {
      setCooldownActive(false);
      return;
    }

    const timer = setTimeout(() => {
      setCooldownTime(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [cooldownTime]);

  const activateCooldown = (errorMessage: string) => {
    const waitTime = extractCooldownTime(errorMessage);
    setCooldownTime(waitTime);
    setCooldownActive(true);
    return waitTime;
  };

  return {
    cooldownActive,
    cooldownTime,
    setCooldownActive,
    setCooldownTime,
    activateCooldown
  };
};
