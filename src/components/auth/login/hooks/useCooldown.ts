
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

  const activateCooldown = (waitTimeOrErrorMessage: string) => {
    // Extract the number from the string or parse it directly if it's a numeric string
    const waitTime = waitTimeOrErrorMessage.includes('rate limit') 
      ? extractCooldownTime(waitTimeOrErrorMessage) 
      : parseInt(waitTimeOrErrorMessage, 10);
    
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
