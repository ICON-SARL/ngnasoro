
import React from 'react';

export interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (newView: string, data?: any) => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, onNavigate }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 bg-black/80">
      <div className="bg-white h-full w-3/4 flex flex-col p-4">
        <button onClick={onClose} className="self-end">
          X
        </button>
        <nav className="flex flex-col space-y-4 mt-8">
          <button 
            onClick={() => { onNavigate('/mobile-flow/main'); onClose(); }}
            className="text-left py-2 border-b"
          >
            Accueil
          </button>
          <button 
            onClick={() => { onNavigate('/mobile-flow/loans'); onClose(); }}
            className="text-left py-2 border-b"
          >
            Prêts
          </button>
          <button 
            onClick={() => { onNavigate('/mobile-flow/savings'); onClose(); }}
            className="text-left py-2 border-b"
          >
            Épargne
          </button>
          <button 
            onClick={() => { onNavigate('/mobile-flow/transactions'); onClose(); }}
            className="text-left py-2 border-b"
          >
            Transactions
          </button>
          <button 
            onClick={() => { onNavigate('/mobile-flow/account'); onClose(); }}
            className="text-left py-2 border-b"
          >
            Mon Compte
          </button>
        </nav>
      </div>
    </div>
  );
};

export default MobileMenu;
