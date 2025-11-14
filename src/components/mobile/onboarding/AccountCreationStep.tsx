import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ModernButton } from '@/components/ui/modern-button';
import { ModernInput } from '@/components/ui/modern-input';
import { User, Mail, Phone, MapPin } from 'lucide-react';

interface AccountCreationStepProps {
  onNext: () => void;
  onPrevious?: () => void;
}

export const AccountCreationStep: React.FC<AccountCreationStepProps> = ({
  onNext,
  onPrevious,
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.fullName) newErrors.fullName = 'Le nom complet est requis';
    if (!formData.email) newErrors.email = 'L\'email est requis';
    if (!formData.phone) newErrors.phone = 'Le téléphone est requis';
    if (!formData.address) newErrors.address = 'L\'adresse est requise';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onNext();
    }
  };

  return (
    <div className="h-full flex flex-col p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Créez votre compte</h2>
        <p className="text-muted-foreground">
          Remplissez vos informations personnelles
        </p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ModernInput
            type="text"
            label="Nom complet"
            placeholder="Entrez votre nom complet"
            value={formData.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            error={errors.fullName}
            icon={<User className="w-5 h-5" />}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ModernInput
            type="email"
            label="Email"
            placeholder="votre.email@exemple.com"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            error={errors.email}
            icon={<Mail className="w-5 h-5" />}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <ModernInput
            type="tel"
            label="Téléphone"
            placeholder="+225 XX XX XX XX XX"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            error={errors.phone}
            icon={<Phone className="w-5 h-5" />}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <ModernInput
            type="text"
            label="Adresse"
            placeholder="Votre adresse complète"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            error={errors.address}
            icon={<MapPin className="w-5 h-5" />}
          />
        </motion.div>
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
          onClick={handleSubmit}
          className="flex-1"
        >
          Continuer
        </ModernButton>
      </div>
    </div>
  );
};
