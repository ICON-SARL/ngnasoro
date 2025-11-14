import React from 'react';
import { motion } from 'framer-motion';
import { Shield, ChevronRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';

interface KycProgressCardProps {
  kycLevel: number;
  clientCode?: string | null;
}

const KycProgressCard: React.FC<KycProgressCardProps> = ({ kycLevel, clientCode }) => {
  const navigate = useNavigate();

  const getKycInfo = (level: number) => {
    switch (level) {
      case 1:
        return {
          label: 'Niveau 1 - Basique',
          description: 'Limite: 50K FCFA',
          progress: 33,
          color: 'text-orange-600',
          bgColor: 'bg-orange-100',
        };
      case 2:
        return {
          label: 'Niveau 2 - Intermédiaire',
          description: 'Limite: 500K FCFA',
          progress: 66,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
        };
      case 3:
        return {
          label: 'Niveau 3 - Complet',
          description: 'Sans limite',
          progress: 100,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
        };
      default:
        return {
          label: 'Non vérifié',
          description: 'Complétez votre KYC',
          progress: 0,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
        };
    }
  };

  const kycInfo = getKycInfo(kycLevel);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="bg-card rounded-2xl p-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate('/mobile-flow/profile')}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`${kycInfo.bgColor} p-2 rounded-lg`}>
            <Shield className={`w-4 h-4 ${kycInfo.color}`} />
          </div>
          <div>
            <p className="font-medium text-sm text-foreground">{kycInfo.label}</p>
            <p className="text-xs text-muted-foreground">{kycInfo.description}</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </div>

      <Progress value={kycInfo.progress} className="h-2 mb-2" />
      
      {clientCode && (
        <p className="text-xs text-muted-foreground">
          Code client: <span className="font-mono font-semibold text-foreground">{clientCode}</span>
        </p>
      )}
      
      {kycLevel < 3 && (
        <p className="text-xs text-primary mt-2 font-medium">
          Augmentez votre niveau pour plus d'avantages
        </p>
      )}
    </motion.div>
  );
};

export default KycProgressCard;
