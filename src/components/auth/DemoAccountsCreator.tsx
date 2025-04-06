
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  UserPlus, 
  Check, 
  Loader2, 
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const DemoAccountsCreator = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const createTestAccounts = async () => {
    setIsCreating(true);
    setResult(null);
    setError(null);

    try {
      const accounts = [
        { email: 'client@test.com', password: 'password123', role: 'user' },
        { email: 'sfd@test.com', password: 'password123', role: 'sfd_admin' },
        { email: 'admin@test.com', password: 'password123', role: 'admin' }
      ];

      const results = [];

      for (const account of accounts) {
        try {
          // Check if user already exists
          const { data: existingUsers } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', account.email)
            .maybeSingle();

          if (existingUsers) {
            // User exists, check their role
            const { data: userData, error: userError } = await supabase.auth.admin.getUserById(existingUsers.id);
            
            if (userError) throw userError;
            
            const hasCorrectRole = userData?.user.app_metadata?.role === account.role;
            
            results.push({
              email: account.email,
              status: 'already_exists',
              role: userData?.user.app_metadata?.role || 'unknown',
              hasCorrectRole
            });
          } else {
            // Create user
            const { data, error } = await supabase.auth.signUp({
              email: account.email,
              password: account.password,
              options: {
                data: { 
                  role: account.role,
                  full_name: account.role === 'user' ? 'Client Test' : account.role === 'sfd_admin' ? 'SFD Admin' : 'MEREF Admin'
                }
              }
            });
            
            if (error) throw error;
            
            results.push({
              email: account.email,
              status: 'created',
              userId: data.user?.id
            });
          }
        } catch (err: any) {
          results.push({
            email: account.email,
            status: 'error',
            error: err.message
          });
        }
      }

      console.log("Test accounts creation response:", {
        success: true,
        message: "Test accounts processed",
        results
      });
      
      setResult({
        success: true,
        message: "Test accounts processed",
        results
      });
    } catch (err: any) {
      console.error("Error creating test accounts:", err);
      setError(err.message);
    } finally {
      setIsCreating(false);
      setIsExpanded(true);
    }
  };

  return (
    <div className="bg-gray-50 border-t p-3 px-4">
      <div 
        className="flex items-center justify-between cursor-pointer" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <UserPlus className="h-4 w-4 text-gray-500 mr-2" />
          <span className="text-sm text-gray-700 font-medium">Comptes de démonstration</span>
        </div>
        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </div>
      
      {isExpanded && (
        <div className="mt-3 space-y-3">
          <div className="text-xs text-gray-600">
            Créez rapidement des comptes de test pour les différents rôles:
          </div>
          
          <div className="space-y-1 text-xs">
            <div className="flex justify-between items-center py-1 px-2 bg-white rounded border">
              <div>
                <span className="font-medium">client@test.com</span> / password123
              </div>
              <Badge variant="outline" className="bg-gray-100">Client</Badge>
            </div>
            
            <div className="flex justify-between items-center py-1 px-2 bg-white rounded border">
              <div>
                <span className="font-medium">sfd@test.com</span> / password123
              </div>
              <Badge variant="outline" className="bg-blue-100 text-blue-800">SFD Admin</Badge>
            </div>
            
            <div className="flex justify-between items-center py-1 px-2 bg-white rounded border">
              <div>
                <span className="font-medium">admin@test.com</span> / password123
              </div>
              <Badge variant="outline" className="bg-amber-100 text-amber-800">MEREF Admin</Badge>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 p-2 rounded text-red-700 text-xs flex items-start">
              <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          
          {result && (
            <div className="bg-green-50 p-2 rounded text-green-700 text-xs">
              {result.results.map((r: any, i: number) => (
                <div key={i} className="flex items-center gap-1">
                  <Check className="h-3 w-3 flex-shrink-0" />
                  <span>{r.email}: {r.status}</span>
                </div>
              ))}
            </div>
          )}
          
          <Button 
            size="sm" 
            variant="outline" 
            className="w-full text-xs h-8"
            disabled={isCreating}
            onClick={createTestAccounts}
          >
            {isCreating ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Création en cours...
              </>
            ) : (
              'Créer/Vérifier comptes de test'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default DemoAccountsCreator;
