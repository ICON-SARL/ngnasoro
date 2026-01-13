import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Slider } from '@/components/ui/slider';

interface AmountSliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}

const AmountSlider: React.FC<AmountSliderProps> = ({
  value,
  min,
  max,
  step = 25000,
  onChange
}) => {
  const formatAmount = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(amount % 1000000 === 0 ? 0 : 1)}M`;
    }
    return `${(amount / 1000).toFixed(0)}K`;
  };

  const formatFullAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

  const markers = [
    { value: min, label: formatAmount(min) },
    { value: Math.round((max - min) * 0.25 + min), label: formatAmount(Math.round((max - min) * 0.25 + min)) },
    { value: Math.round((max - min) * 0.5 + min), label: formatAmount(Math.round((max - min) * 0.5 + min)) },
    { value: Math.round((max - min) * 0.75 + min), label: formatAmount(Math.round((max - min) * 0.75 + min)) },
    { value: max, label: formatAmount(max) },
  ];

  return (
    <div className="space-y-6">
      {/* Animated Amount Display */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-2">Montant souhaité</p>
        <AnimatePresence mode="wait">
          <motion.div
            key={value}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.15 }}
            className="flex items-baseline justify-center gap-2"
          >
            <span className="text-4xl font-bold text-foreground tracking-tight">
              {formatFullAmount(value)}
            </span>
            <span className="text-lg text-muted-foreground font-medium">FCFA</span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Custom Slider */}
      <div className="px-2">
        <Slider
          value={[value]}
          min={min}
          max={max}
          step={step}
          onValueChange={(vals) => onChange(vals[0])}
          className="w-full [&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_[role=slider]]:border-2 [&_[role=slider]]:border-primary [&_[role=slider]]:bg-background [&_[role=slider]]:shadow-md"
        />
      </div>

      {/* Markers */}
      <div className="flex justify-between px-1">
        {markers.map((marker, index) => (
          <span
            key={index}
            className={`text-xs transition-colors ${
              value >= marker.value 
                ? 'text-primary font-medium' 
                : 'text-muted-foreground'
            }`}
          >
            {marker.label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default AmountSlider;
