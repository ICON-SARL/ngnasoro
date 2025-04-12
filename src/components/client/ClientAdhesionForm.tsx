
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useClientAdhesions } from '@/hooks/useClientAdhesions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { ClientAdhesionRequest } from '@/types/adhesionTypes';
import { formatDate } from '@/utils/formatters';

interface AdhesionFormProps {
  sfdId: string;
  sfdName?: string;
  onSuccess?: () => void;
}

export function ClientAdhesionForm({ sfdId, sfdName, onSuccess }: AdhesionFormProps) {
  const { createAdhesionRequest, userAdhesionRequests, isLoadingUserAdhesionRequests } = useClientAdhesions();
  const { user } = useAuth();

  // Vérifier si l'utilisateur a déjà une demande en cours pour cette SFD
  const existingRequest = userAdhesionRequests.find(
    request => request.sfd_id === sfdId && request.status === 'pending'
  );
  
  const approvedRequest = userAdhesionRequests.find(
    request => request.sfd_id === sfdId && request.status === 'approved'
  );
  
  const rejectedRequest = userAdhesionRequests.find(
    request => request.sfd_id === sfdId && request.status === 'rejected'
  );

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      full_name: user?.full_name || '',
      email: user?.email || '',
      phone: '',
      address: '',
      id_type: '',
      id_number: '',
      notes: ''
    }
  });

  const onSubmit = (data: any) => {
    createAdhesionRequest.mutate({
      sfd_id: sfdId,
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      id_type: data.id_type,
      id_number: data.id_number,
      notes: data.notes
    }, {
      onSuccess: () => {
        reset();
        if (onSuccess) onSuccess();
      }
    });
  };

  if (isLoadingUserAdhesionRequests) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0D6A51]"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (approvedRequest) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Demande approuvée</AlertTitle>
            <AlertDescription className="text-green-700">
              Votre demande d'adhésion à {sfdName || 'cette SFD'} a été approuvée le {formatDate(approvedRequest.processed_at || '')}.
              Vous pouvez maintenant accéder à tous les services de la SFD.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (existingRequest) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert className="bg-amber-50 border-amber-200">
            <Clock className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800">Demande en attente</AlertTitle>
            <AlertDescription className="text-amber-700">
              Vous avez déjà une demande d'adhésion en attente pour {sfdName || 'cette SFD'} soumise le {formatDate(existingRequest.created_at)}.
              Veuillez patienter pendant que votre demande est examinée.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (rejectedRequest) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert className="bg-red-50 border-red-200">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">Demande rejetée</AlertTitle>
            <AlertDescription className="text-red-700">
              Votre demande d'adhésion à {sfdName || 'cette SFD'} a été rejetée le {formatDate(rejectedRequest.processed_at || '')}.
              {rejectedRequest.notes && (
                <div className="mt-2 p-2 bg-white/50 rounded-md">
                  <strong>Raison du rejet:</strong> {rejectedRequest.notes}
                </div>
              )}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Demande d'adhésion</CardTitle>
        <CardDescription>
          Remplissez ce formulaire pour adhérer à {sfdName || 'la SFD'} et accéder à ses services financiers.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Nom complet *</Label>
            <Input
              id="full_name"
              {...register('full_name', { required: 'Le nom est requis' })}
            />
            {errors.full_name && (
              <p className="text-sm text-red-500">{errors.full_name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email', {
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Adresse email invalide'
                  }
                })}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone *</Label>
              <Input
                id="phone"
                {...register('phone', { required: 'Le téléphone est requis' })}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Adresse</Label>
            <Input
              id="address"
              {...register('address')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="id_type">Type de pièce d'identité</Label>
              <Select onValueChange={(value) => register('id_type').onChange({ target: { value } })}>
                <SelectTrigger id="id_type">
                  <SelectValue placeholder="Sélectionnez un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cni">Carte Nationale d'Identité</SelectItem>
                  <SelectItem value="passport">Passeport</SelectItem>
                  <SelectItem value="permis">Permis de conduire</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="id_number">Numéro de pièce d'identité</Label>
              <Input
                id="id_number"
                {...register('id_number')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes ou informations supplémentaires</Label>
            <Textarea
              id="notes"
              placeholder="Ajoutez toute information supplémentaire qui pourrait être utile pour votre demande..."
              {...register('notes')}
              rows={3}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90"
            disabled={createAdhesionRequest.isPending}
          >
            {createAdhesionRequest.isPending ? 'Envoi en cours...' : 'Soumettre la demande'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
