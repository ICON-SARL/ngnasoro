
import React from 'react';
import { CreditCard, Landmark, Calendar, CheckCircle2 } from 'lucide-react';
import { StepConfig, LoanApplicationStep } from './types';

export const useStepConfig = (language: string): Record<LoanApplicationStep, StepConfig> => {
  return {
    start: {
      title: "Demande de prêt",
      voiceMessage: language === 'bambara' 
        ? "I ni ce. I ka juru daani na mɛnɛ. Juru daani ko la nɔgɔn. A daminɛ walasa ka i ka juru daani kɛ."
        : "Bienvenue dans l'assistant de demande de prêt. Appuyez sur commencer pour débuter votre demande.",
      nextLabel: "Commencer",
      icon: <CreditCard className="h-6 w-6" />,
      progress: 0
    },
    purpose: {
      title: "Objet du prêt",
      voiceMessage: language === 'bambara' 
        ? "I ka juru nafa sugandi. I mako bɛ juru in na mun na?"
        : "Veuillez sélectionner l'objet de votre prêt. Pour quoi souhaitez-vous emprunter?",
      nextLabel: "Continuer",
      prevLabel: "Retour",
      icon: <Landmark className="h-6 w-6" />,
      progress: 20
    },
    amount: {
      title: "Montant du prêt",
      voiceMessage: language === 'bambara' 
        ? "I bɛ wari hakɛ min fɛ sɛbɛn. I mako bɛ juru hakɛ min na?"
        : "Entrez le montant que vous souhaitez emprunter. Quel montant vous convient?",
      nextLabel: "Continuer",
      prevLabel: "Retour",
      icon: <CreditCard className="h-6 w-6" />,
      progress: 40
    },
    duration: {
      title: "Durée du prêt",
      voiceMessage: language === 'bambara' 
        ? "I ka juru kɛ waati jantɛ sugandi. I bɛ juru sara waati hakɛ min kɔnɔ?"
        : "Sélectionnez la durée de remboursement de votre prêt. Sur quelle période souhaitez-vous rembourser?",
      nextLabel: "Continuer",
      prevLabel: "Retour",
      icon: <Calendar className="h-6 w-6" />,
      progress: 60
    },
    location: {
      title: "Agence SFD",
      voiceMessage: language === 'bambara' 
        ? "I ka SFD yɔrɔ min ka kan i la sugandi. Min bɛ i dɛmɛ ka juru ko ɲɛnabɔ."
        : "Sélectionnez l'agence SFD la plus proche de vous pour le traitement de votre demande.",
      nextLabel: "Continuer",
      prevLabel: "Retour",
      icon: <Landmark className="h-6 w-6" />,
      progress: 80
    },
    review: {
      title: "Récapitulatif",
      voiceMessage: language === 'bambara' 
        ? "I ka juru daani kunnafoni lajɛ. Yala i bɛ sɔn ka juru daani kɛ tan wa?"
        : "Vérifiez les détails de votre demande de prêt avant de soumettre. Tout est-il correct?",
      nextLabel: "Soumettre",
      prevLabel: "Retour",
      icon: <CheckCircle2 className="h-6 w-6" />,
      progress: 90
    },
    complete: {
      title: "Demande envoyée",
      voiceMessage: language === 'bambara' 
        ? "I ni ce! I ka juru daani sɛbɛnna ka ɲɛ. I bɛna kunnafoni sɔrɔ ni a labɛnna."
        : "Félicitations! Votre demande de prêt a été envoyée avec succès. Vous recevrez une notification dès qu'elle sera traitée.",
      nextLabel: "Terminer",
      icon: <CheckCircle2 className="h-6 w-6" />,
      progress: 100
    }
  };
};
