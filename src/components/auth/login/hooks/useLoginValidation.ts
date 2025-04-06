
import { useState } from 'react';

export const useLoginValidation = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validateEmail = (email: string): boolean => {
    if (!email || !email.includes('@')) {
      setErrorMessage('Veuillez entrer une adresse e-mail valide.');
      return false;
    }
    return true;
  };

  const validatePassword = (password: string): boolean => {
    if (!password || password.length < 6) {
      setErrorMessage('Veuillez entrer un mot de passe valide (minimum 6 caractères).');
      return false;
    }
    return true;
  };

  const clearError = () => setErrorMessage(null);

  return {
    errorMessage,
    setErrorMessage,
    validateEmail,
    validatePassword,
    clearError
  };
};
