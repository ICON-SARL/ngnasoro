
import { useState } from 'react';

export const useLoginValidation = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validateEmail = (email: string): boolean => {
    if (!email.trim()) {
      setErrorMessage('Veuillez saisir votre adresse e-mail.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Veuillez saisir une adresse e-mail valide.');
      return false;
    }

    return true;
  };

  const validatePassword = (password: string): boolean => {
    if (!password) {
      setErrorMessage('Veuillez saisir votre mot de passe.');
      return false;
    }

    if (password.length < 6) {
      setErrorMessage('Le mot de passe doit contenir au moins 6 caractères.');
      return false;
    }

    return true;
  };

  const clearError = () => {
    setErrorMessage(null);
  };

  return {
    errorMessage,
    setErrorMessage,
    validateEmail,
    validatePassword,
    clearError
  };
};
