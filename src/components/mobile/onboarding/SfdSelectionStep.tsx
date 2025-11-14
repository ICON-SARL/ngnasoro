import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ModernButton } from '@/components/ui/modern-button';
import { Search, Building2, MapPin, CheckCircle } from 'lucide-react';
import { ModernInput } from '@/components/ui/modern-input';

interface SfdSelectionStepProps {
  onNext: () => void;
  onPrevious?: () => void;
}

const mockSfds = [
  { id: '1', name: 'SFD Centre', region: 'Abidjan', services: 'Prêts, Épargne' },
  { id: '2', name: 'SFD Nord', region: 'Bouaké', services: 'Prêts, Transferts' },
  { id: '3', name: 'SFD Ouest', region: 'San-Pédro', services: 'Épargne, Assurance' },
];

export const SfdSelectionStep: React.FC<SfdSelectionStepProps> = ({
  onNext,
  onPrevious,
}) => {
  const [selectedSfd, setSelectedSfd] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSfds = mockSfds.filter((sfd) =>
    sfd.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sfd.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Choisissez votre SFD</h2>
        <p className="text-muted-foreground">
          Sélectionnez la structure de microfinance la plus proche de vous
        </p>
      </div>

      <div className="mb-6">
        <ModernInput
          type="text"
          placeholder="Rechercher une SFD..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<Search className="w-5 h-5" />}
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 mb-6">
        {filteredSfds.map((sfd, index) => (
          <motion.div
            key={sfd.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => setSelectedSfd(sfd.id)}
            className={`p-4 rounded-xl border-2 cursor-pointer smooth-transition ${
              selectedSfd === sfd.id
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">{sfd.name}</h3>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <MapPin className="w-4 h-4" />
                  <span>{sfd.region}</span>
                </div>
                <p className="text-sm text-muted-foreground">{sfd.services}</p>
              </div>
              {selectedSfd === sfd.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' }}
                >
                  <CheckCircle className="w-6 h-6 text-primary" />
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-4">
        {onPrevious && (
          <ModernButton
            variant="ghost"
            size="lg"
            onClick={onPrevious}
            className="flex-1"
          >
            Retour
          </ModernButton>
        )}
        <ModernButton
          variant="primary"
          size="lg"
          onClick={onNext}
          disabled={!selectedSfd}
          className="flex-1"
        >
          Continuer
        </ModernButton>
      </div>
    </div>
  );
};
