
import { useState, useEffect } from 'react';

export const useCooldown = () => {
  const [cooldownActive, setCooldownActive] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (cooldownActive && cooldownTime > 0) {
      interval = setInterval(() => {
        setCooldownTime(prev => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            setCooldownActive(false);
            if (interval) clearInterval(interval);
            return 0;
          }
          return newTime;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [cooldownActive, cooldownTime]);
  
  const activateCooldown = (seconds: string | number) => {
    const time = typeof seconds === 'string' ? parseInt(seconds, 10) : seconds;
    setCooldownTime(time);
    setCooldownActive(true);
  };
  
  return {
    cooldownActive,
    cooldownTime,
    activateCooldown
  };
};
