import React from 'react';
import { motion } from 'framer-motion';

interface DurationPillsProps {
  value: number;
  options: number[];
  onChange: (duration: number) => void;
}

const DurationPills: React.FC<DurationPillsProps> = ({
  value,
  options,
  onChange
}) => {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground text-center">Durée du prêt</p>
      
      <div className="flex flex-wrap justify-center gap-2">
        {options.map((duration) => {
          const isSelected = value === duration;
          
          return (
            <motion.button
              key={duration}
              onClick={() => onChange(duration)}
              whileTap={{ scale: 0.95 }}
              className={`
                relative px-4 py-2 rounded-full text-sm font-medium
                transition-colors duration-200
                ${isSelected 
                  ? 'text-primary-foreground' 
                  : 'text-muted-foreground bg-muted/50 hover:bg-muted'
                }
              `}
            >
              {isSelected && (
                <motion.div
                  layoutId="duration-pill-bg"
                  className="absolute inset-0 bg-primary rounded-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative z-10">
                {duration} mois
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default DurationPills;
