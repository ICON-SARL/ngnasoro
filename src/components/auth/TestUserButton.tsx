
import React from 'react';
import { supabase } from '@/integrations/supabase/client';

const TestUserButton = () => {
  const createTestUsers = async () => {
    if (!window.confirm("Créer des utilisateurs de test? Cela va créer un Super Admin, un Admin SFD et un utilisateur standard.")) {
      return;
    }
    
    const testUsers = [
      {
        email: "superadmin@meref.ml",
        password: "testadmin123",
        full_name: "Super Admin Test",
        role: "admin"
      },
      {
        email: "sfdadmin@meref.ml",
        password: "testadmin123",
        full_name: "SFD Admin Test",
        role: "sfd_admin"
      },
      {
        email: "user@meref.ml",
        password: "testuser123",
        full_name: "Utilisateur Test",
        role: "user"
      }
    ];
    
    try {
      for (const user of testUsers) {
        const { data, error } = await supabase.functions.invoke('create-admin-user', {
          body: JSON.stringify(user)
        });
        
        if (error) {
          console.error(`Erreur lors de la création de ${user.email}:`, error);
        } else {
          console.log(`Utilisateur ${user.email} créé avec succès:`, data);
        }
      }
      
      alert("Utilisateurs de test créés avec succès. Vous pouvez maintenant vous connecter avec:\n\n" +
            "Super Admin: superadmin@meref.ml / testadmin123\n" +
            "SFD Admin: sfdadmin@meref.ml / testadmin123\n" +
            "Utilisateur: user@meref.ml / testuser123");
    } catch (error) {
      console.error("Erreur lors de la création des utilisateurs de test:", error);
      alert("Erreur lors de la création des utilisateurs de test. Voir la console pour plus de détails.");
    }
  };

  return (
    <div className="mt-2 text-center pb-2">
      <button
        onClick={createTestUsers}
        className="text-xs text-gray-500 hover:underline"
      >
        Créer des utilisateurs de test
      </button>
    </div>
  );
};

export default TestUserButton;
