
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogDescription, DialogFooter 
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  Upload, FileText, AlertCircle, CheckCircle 
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { SfdClient } from '@/types/sfdClients';

interface ClientImportProps {
  onImport: (clients: Omit<SfdClient, 'id' | 'created_at' | 'status' | 'kyc_level' | 'sfd_id'>[]) => void;
  isImporting: boolean;
}

export function ClientImport({ onImport, isImporting }: ClientImportProps) {
  const [open, setOpen] = useState(false);
  const [importData, setImportData] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<any[] | null>(null);

  const handleDataChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setImportData(e.target.value);
    setImportError(null);
    setPreviewData(null);
  };

  const validateAndPreview = () => {
    try {
      // Essayer de parser les données JSON
      const parsed = JSON.parse(importData);
      
      if (!Array.isArray(parsed)) {
        setImportError('Les données doivent être un tableau d\'objets clients');
        return;
      }
      
      if (parsed.length === 0) {
        setImportError('Aucun client à importer');
        return;
      }
      
      // Vérifier que chaque objet a les champs requis
      const requiredFields = ['full_name'];
      const missingFields = [];
      
      for (const client of parsed) {
        for (const field of requiredFields) {
          if (!client[field]) {
            missingFields.push(`'${field}' manquant pour un client`);
          }
        }
      }
      
      if (missingFields.length > 0) {
        setImportError(`Erreurs de validation: ${missingFields.join(', ')}`);
        return;
      }
      
      // Prévisualiser les données
      setPreviewData(parsed.slice(0, 5)); // Afficher les 5 premiers
      setImportError(null);
    } catch (error) {
      setImportError('Format JSON invalide. Veuillez vérifier les données.');
    }
  };

  const handleImport = () => {
    try {
      const clients = JSON.parse(importData);
      onImport(clients);
      setOpen(false);
      setImportData('');
      setPreviewData(null);
    } catch (error) {
      setImportError('Erreur lors de l\'import: ' + (error as Error).message);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        setImportData(event.target?.result as string);
      } catch (error) {
        setImportError('Erreur lors de la lecture du fichier');
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <Button 
        onClick={() => setOpen(true)} 
        variant="outline"
        className="flex items-center"
      >
        <Upload className="h-4 w-4 mr-2" />
        Importer des clients
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Importer des clients</DialogTitle>
            <DialogDescription>
              Importez plusieurs clients à la fois en utilisant un fichier JSON.
              Chaque client doit avoir au minimum un nom complet.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <label htmlFor="clientFile" className="text-sm font-medium">
                Fichier JSON
              </label>
              <input
                id="clientFile"
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="importData" className="text-sm font-medium">
                Ou collez les données JSON directement
              </label>
              <Textarea
                id="importData"
                placeholder='[{"full_name": "Nom Client", "email": "email@exemple.com", "phone": "+22500000000"}]'
                value={importData}
                onChange={handleDataChange}
                className="h-32 font-mono text-sm"
              />
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={validateAndPreview}
                disabled={!importData.trim()}
              >
                <FileText className="h-4 w-4 mr-2" />
                Valider et prévisualiser
              </Button>
            </div>
            
            {importError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erreur</AlertTitle>
                <AlertDescription>{importError}</AlertDescription>
              </Alert>
            )}
            
            {previewData && (
              <div className="border rounded-md p-4">
                <div className="flex items-center mb-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span className="font-medium">
                    Aperçu ({previewData.length} sur {JSON.parse(importData).length} clients)
                  </span>
                </div>
                <div className="overflow-auto max-h-40">
                  <pre className="text-xs whitespace-pre-wrap">
                    {JSON.stringify(previewData, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
            >
              Annuler
            </Button>
            <Button 
              variant="default"
              onClick={handleImport}
              disabled={isImporting || !previewData}
            >
              {isImporting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Importation...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Importer {previewData ? JSON.parse(importData).length : 0} clients
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
