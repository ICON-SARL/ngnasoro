
import React from 'react';
import { Button } from '@/components/ui/button';
import { Cog, Download, Upload } from 'lucide-react';

interface SettingsHeaderProps {
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  onSave: () => void;
  onExport: () => void;
  onImport: () => void;
}

export const SettingsHeader: React.FC<SettingsHeaderProps> = ({ 
  isEditing, 
  setIsEditing, 
  onSave,
  onExport,
  onImport
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold">Paramètres Système</h2>
        <p className="text-muted-foreground">
          Configurez les paramètres globaux du système MEREF
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        {isEditing ? (
          <>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Annuler
            </Button>
            <Button onClick={onSave}>
              Sauvegarder
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={onExport}>
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </Button>
            <Button variant="outline" onClick={onImport}>
              <Upload className="mr-2 h-4 w-4" />
              Importer
            </Button>
            <Button onClick={() => setIsEditing(true)}>
              <Cog className="mr-2 h-4 w-4" />
              Modifier
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
