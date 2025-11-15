import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, Building, MapPin, Mail, Phone, FileText, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SfdDetails {
  id: string;
  name: string;
  code: string;
  region: string;
  contact_email: string;
  phone: string;
  status: string;
  submitted_at: string;
  description: string;
  address: string;
}

interface SfdApprovalFormProps {
  sfd: SfdDetails | null;
  onApproved: () => void;
  onRejected: () => void;
  onCancel: () => void;
}

export function SfdApprovalForm({ sfd, onApproved, onRejected, onCancel }: SfdApprovalFormProps) {
  const [comments, setComments] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const { toast } = useToast();

  if (!sfd) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            <Building className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>Sélectionnez une demande à examiner</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleApprove = async () => {
    try {
      setIsApproving(true);

      const { data, error } = await supabase.functions.invoke('approve-sfd', {
        body: JSON.stringify({
          sfd_id: sfd.id,
          comments: comments || null
        })
      });

      if (error) throw error;

      toast({
        title: 'SFD Approuvé',
        description: `${sfd.name} a été approuvé avec succès`,
      });

      onApproved();
    } catch (error: any) {
      console.error('Error approving SFD:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible d\'approuver le SFD',
        variant: 'destructive'
      });
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast({
        title: 'Raison requise',
        description: 'Veuillez fournir une raison pour le rejet',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsRejecting(true);

      const { data, error } = await supabase.functions.invoke('reject-sfd', {
        body: JSON.stringify({
          sfd_id: sfd.id,
          rejection_reason: rejectionReason
        })
      });

      if (error) throw error;

      toast({
        title: 'SFD Rejeté',
        description: `${sfd.name} a été rejeté`,
      });

      onRejected();
    } catch (error: any) {
      console.error('Error rejecting SFD:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de rejeter le SFD',
        variant: 'destructive'
      });
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">{sfd.name}</CardTitle>
            <CardDescription>Code: {sfd.code}</CardDescription>
          </div>
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            En attente d'approbation
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Informations générales */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Informations Générales
          </h3>
          <div className="space-y-3 pl-6">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Région</p>
                <p className="text-sm text-muted-foreground">{sfd.region}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Email de contact</p>
                <p className="text-sm text-muted-foreground">{sfd.contact_email}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Téléphone</p>
                <p className="text-sm text-muted-foreground">{sfd.phone}</p>
              </div>
            </div>
            {sfd.address && (
              <div className="flex items-start gap-2">
                <Building className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Adresse</p>
                  <p className="text-sm text-muted-foreground">{sfd.address}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {sfd.description && (
          <>
            <Separator />
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-sm text-muted-foreground">{sfd.description}</p>
            </div>
          </>
        )}

        <Separator />

        <div>
          <p className="text-sm text-muted-foreground">
            Demande soumise {formatDistanceToNow(new Date(sfd.submitted_at), { addSuffix: true, locale: fr })}
          </p>
        </div>

        <Separator />

        {/* Formulaire d'approbation */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="comments">Commentaires (optionnel)</Label>
            <Textarea
              id="comments"
              placeholder="Ajouter des notes ou commentaires sur cette approbation..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleApprove}
              disabled={isApproving || isRejecting}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isApproving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Approbation...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approuver
                </>
              )}
            </Button>
            <Button
              onClick={onCancel}
              disabled={isApproving || isRejecting}
              variant="outline"
            >
              Annuler
            </Button>
          </div>
        </div>

        <Separator />

        {/* Section de rejet */}
        <div className="space-y-4 bg-red-50 p-4 rounded-lg border border-red-100">
          <h3 className="font-semibold text-red-900">Rejeter la demande</h3>
          <div>
            <Label htmlFor="rejection_reason">Raison du rejet *</Label>
            <Textarea
              id="rejection_reason"
              placeholder="Expliquez pourquoi cette demande est rejetée..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              className="bg-white"
            />
          </div>
          <Button
            onClick={handleReject}
            disabled={isApproving || isRejecting || !rejectionReason.trim()}
            variant="destructive"
            className="w-full"
          >
            {isRejecting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Rejet...
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 mr-2" />
                Rejeter la demande
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
