
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export function CapacitorGuide() {
  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <Card>
        <CardHeader className="bg-primary/5">
          <CardTitle className="text-xl text-primary">Guide de création d'APK</CardTitle>
          <CardDescription>
            Comment créer un APK pour l'application N'GNA SÔRÔ!
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <p className="font-medium text-lg">
            Pour créer une APK de cette application, suivez ces étapes:
          </p>
          
          <ol className="space-y-4 list-decimal pl-6">
            <li>
              <p className="font-medium">Exportez le projet vers GitHub</p>
              <p className="text-sm text-muted-foreground">Utilisez le bouton "Export to GitHub" dans l'interface Lovable</p>
            </li>
            <Separator className="my-2" />
            
            <li>
              <p className="font-medium">Clonez le dépôt sur votre machine locale</p>
              <div className="bg-muted p-2 rounded text-sm font-mono">
                git clone [URL_DU_REPO]
              </div>
            </li>
            <Separator className="my-2" />
            
            <li>
              <p className="font-medium">Installez les dépendances</p>
              <div className="bg-muted p-2 rounded text-sm font-mono">
                npm install
              </div>
            </li>
            <Separator className="my-2" />
            
            <li>
              <p className="font-medium">Initialisez Capacitor (si ce n'est pas déjà fait)</p>
              <div className="bg-muted p-2 rounded text-sm font-mono">
                npx cap init
              </div>
            </li>
            <Separator className="my-2" />
            
            <li>
              <p className="font-medium">Ajoutez la plateforme Android</p>
              <div className="bg-muted p-2 rounded text-sm font-mono">
                npx cap add android
              </div>
            </li>
            <Separator className="my-2" />
            
            <li>
              <p className="font-medium">Construisez l'application web</p>
              <div className="bg-muted p-2 rounded text-sm font-mono">
                npm run build
              </div>
            </li>
            <Separator className="my-2" />
            
            <li>
              <p className="font-medium">Synchronisez la build avec le projet Android</p>
              <div className="bg-muted p-2 rounded text-sm font-mono">
                npx cap sync
              </div>
            </li>
            <Separator className="my-2" />
            
            <li>
              <p className="font-medium">Ouvrez le projet dans Android Studio</p>
              <div className="bg-muted p-2 rounded text-sm font-mono">
                npx cap open android
              </div>
            </li>
            <Separator className="my-2" />
            
            <li>
              <p className="font-medium">Dans Android Studio, construisez l'APK</p>
              <p className="text-sm text-muted-foreground">Sélectionnez Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</p>
            </li>
          </ol>
          
          <div className="mt-6 p-4 bg-yellow-100 rounded-lg">
            <p className="font-medium text-amber-800">Note importante:</p>
            <p className="text-sm text-amber-700">
              Vous aurez besoin d'Android Studio installé sur votre ordinateur pour compléter ce processus. 
              L'APK généré se trouvera dans le dossier <span className="font-mono">app/build/outputs/apk/debug</span>.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CapacitorGuide;
