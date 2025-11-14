import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TontinePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-gradient-to-br from-sky-500 to-blue-600 text-white p-6 pb-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold mb-2">Tontines</h1>
        <p className="text-sm opacity-90">
          Épargnez ensemble, atteignez vos objectifs
        </p>
      </div>

      <div className="px-4 -mt-4">
        <div className="bg-card rounded-3xl p-6 text-center border border-border">
          <Users className="w-16 h-16 text-sky-600 mx-auto mb-4" />
          <h2 className="font-semibold text-lg mb-2">Fonctionnalité à venir</h2>
          <p className="text-sm text-muted-foreground mb-4">
            La gestion des tontines sera bientôt disponible
          </p>
          <Button className="bg-sky-600 hover:bg-sky-700 rounded-2xl">
            <Plus className="w-4 h-4 mr-2" />
            Me notifier
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TontinePage;
