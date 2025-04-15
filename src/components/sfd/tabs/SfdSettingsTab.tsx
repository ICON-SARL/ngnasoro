
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { SfdSettings } from '@/types/sfd-types';

interface SfdSettingsTabProps {
  settings: SfdSettings;
}

export function SfdSettingsTab({ settings }: SfdSettingsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Paramètres de la SFD</CardTitle>
        <CardDescription>
          Configuration des paramètres opérationnels de votre SFD
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Paramètres des prêts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm font-medium">Montant maximum du prêt</p>
                <p className="text-sm text-muted-foreground">
                  {settings.loan_settings?.max_loan_amount?.toLocaleString() || 0} FCFA
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Montant minimum du prêt</p>
                <p className="text-sm text-muted-foreground">
                  {settings.loan_settings?.min_loan_amount?.toLocaleString() || 0} FCFA
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Taux d'intérêt par défaut</p>
                <p className="text-sm text-muted-foreground">
                  {settings.loan_settings?.default_interest_rate || 0}%
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Paramètres de sécurité</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm font-medium">Expiration du mot de passe</p>
                <p className="text-sm text-muted-foreground">
                  {settings.security_settings?.password_expiry_days || 90} jours
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Timeout de session</p>
                <p className="text-sm text-muted-foreground">
                  {settings.security_settings?.session_timeout_minutes || 30} minutes
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
