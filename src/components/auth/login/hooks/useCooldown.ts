
import { useState, useEffect } from 'react';

export const useCooldown = (initialValue: number = 0) => {
  const [cooldownTime, setCooldownTime] = useState<number>(initialValue);
  const [cooldownActive, setCooldownActive] = useState<boolean>(initialValue > 0);

  useEffect(() => {
    if (cooldownTime <= 0) {
      setCooldownActive(false);
      return;
    }
    
    const timer = setInterval(() => {
      setCooldownTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCooldownActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [cooldownTime]);

  const activateCooldown = (seconds: string | number) => {
    const time = typeof seconds === 'string' ? parseInt(seconds, 10) : seconds;
    if (isNaN(time) || time <= 0) return;
    
    setCooldownTime(time);
    setCooldownActive(true);
  };

  return { cooldownActive, cooldownTime, activateCooldown };
};
