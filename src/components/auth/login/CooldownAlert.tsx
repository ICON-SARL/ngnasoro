
import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface CooldownAlertProps {
  active: boolean;
  remainingTime: number;
}

const CooldownAlert: React.FC<CooldownAlertProps> = ({ active, remainingTime }) => {
  const [timeLeft, setTimeLeft] = useState(remainingTime);

  useEffect(() => {
    if (!active) return;
    
    setTimeLeft(remainingTime);
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [active, remainingTime]);

  if (!active) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-md flex items-start gap-3">
      <Clock className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-sm font-medium">Connexion temporairement bloquée</p>
        <p className="text-xs mt-1">
          Veuillez attendre <span className="font-semibold">{timeLeft}</span> secondes avant de réessayer
        </p>
      </div>
    </div>
  );
};

export default CooldownAlert;
