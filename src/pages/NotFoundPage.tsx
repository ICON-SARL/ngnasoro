
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[70vh]">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-xl mb-6">Page non trouvée</p>
      <p className="mb-8">La page que vous recherchez n'existe pas ou a été déplacée.</p>
      <Link 
        to="/" 
        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors"
      >
        Retour à l'accueil
      </Link>
    </div>
  );
};

export default NotFoundPage;
