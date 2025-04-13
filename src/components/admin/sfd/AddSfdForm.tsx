
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SfdForm } from './SfdForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SfdFormValues } from './schemas/sfdFormSchema';

interface AdminFormData {
  full_name: string;
  email: string;
  password: string;
}

interface AddSfdFormProps {
  onSubmit: (formData: SfdFormValues, createAdmin: boolean, adminData: AdminFormData | null) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function AddSfdForm({ onSubmit, onCancel, isSubmitting = false }: AddSfdFormProps) {
  const [activeTab, setActiveTab] = useState<string>('sfd');
  const [createAdmin, setCreateAdmin] = useState<boolean>(false);
  const [adminData, setAdminData] = useState<AdminFormData>({
    full_name: '',
    email: '',
    password: '',
  });
  
  // Pour vérifier si les données administrateur sont valides
  const isAdminDataValid = () => {
    if (!createAdmin) return true;
    return (
      adminData.full_name.trim() !== '' &&
      adminData.email.trim() !== '' &&
      adminData.password.trim().length >= 8
    );
  };

  const handleFormSubmit = (formData: SfdFormValues) => {
    console.log("AddSfdForm: handleFormSubmit", { formData, createAdmin, adminData: createAdmin ? adminData : null });
    onSubmit(formData, createAdmin, createAdmin ? adminData : null);
  };

  const handleAdminDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAdminData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleCreateAdmin = () => {
    setCreateAdmin(!createAdmin);
    if (!createAdmin) {
      setActiveTab('admin');
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="sfd">Informations SFD</TabsTrigger>
          <TabsTrigger value="admin" disabled={!createAdmin}>Admin SFD</TabsTrigger>
        </TabsList>

        <TabsContent value="sfd" className="space-y-4 pt-4">
          <SfdForm 
            onSubmit={handleFormSubmit} 
            onCancel={onCancel} 
            isLoading={isSubmitting}
            formMode="create"
          />
          
          <div className="mt-4 flex items-center space-x-2">
            <input
              type="checkbox"
              id="createAdmin"
              checked={createAdmin}
              onChange={toggleCreateAdmin}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor="createAdmin">Créer un administrateur pour cette SFD</Label>
          </div>

          {createAdmin && (
            <div className="mt-2">
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => setActiveTab('admin')}
              >
                Configurer l'administrateur →
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="admin" className="space-y-4 pt-4">
          {createAdmin ? (
            <>
              <Alert className="mb-4 bg-blue-50 text-blue-800 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Configurez les informations de l'administrateur pour cette SFD
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="admin-name">Nom complet</Label>
                  <Input
                    id="admin-name"
                    name="full_name"
                    value={adminData.full_name}
                    onChange={handleAdminDataChange}
                    placeholder="Nom complet de l'administrateur"
                  />
                </div>

                <div>
                  <Label htmlFor="admin-email">Email</Label>
                  <Input
                    id="admin-email"
                    name="email"
                    type="email"
                    value={adminData.email}
                    onChange={handleAdminDataChange}
                    placeholder="email@sfd.com"
                  />
                </div>

                <div>
                  <Label htmlFor="admin-password">Mot de passe</Label>
                  <Input
                    id="admin-password"
                    name="password"
                    type="password"
                    value={adminData.password}
                    onChange={handleAdminDataChange}
                    placeholder="Mot de passe (8 caractères minimum)"
                  />
                  {adminData.password && adminData.password.length < 8 && (
                    <p className="text-red-500 text-xs mt-1">
                      Le mot de passe doit contenir au moins 8 caractères
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setActiveTab('sfd')}
                >
                  ← Retour aux informations SFD
                </Button>
                <Button 
                  type="button"
                  onClick={() => {
                    const formElement = document.getElementById('sfd-form') as HTMLFormElement;
                    if (formElement) {
                      formElement.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                    }
                  }}
                  disabled={!isAdminDataValid() || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Création en cours...
                    </>
                  ) : (
                    'Créer la SFD avec administrateur'
                  )}
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-center text-muted-foreground mb-4">
                Vous n'avez pas activé la création d'un administrateur pour cette SFD.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setCreateAdmin(true);
                  setActiveTab('sfd');
                }}
              >
                Activer la création d'un administrateur
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {activeTab === 'sfd' && (
        <div className="flex justify-end space-x-2 pt-6">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button 
            type="button"
            onClick={() => {
              const formElement = document.getElementById('sfd-form') as HTMLFormElement;
              if (formElement) {
                formElement.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
              }
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Création en cours...
              </>
            ) : (
              createAdmin ? 'Suivant →' : 'Créer la SFD'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
