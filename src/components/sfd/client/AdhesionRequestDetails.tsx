
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClientAdhesionRequest } from '@/types/adhesionTypes';
import { DocumentPreview } from '@/components/sfd/verification/DocumentPreview';
import { VerificationSteps } from '@/components/sfd/verification/VerificationSteps';
import { useVerificationDocuments } from '@/hooks/useVerificationDocuments';
import { Button } from '@/components/ui/button';
import { AlertCircle, User, Mail, Phone, MapPin } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { formatDate } from '@/utils/formatters';

interface AdhesionRequestDetailsProps {
  request: ClientAdhesionRequest;
  onApprove: () => void;
  onReject: () => void;
}

export function AdhesionRequestDetails({ 
  request, 
  onApprove, 
  onReject 
}: AdhesionRequestDetailsProps) {
  const { documents, isLoading, verifyDocument } = useVerificationDocuments(request.id);

  const handleVerify = async (type: 'id_card' | 'selfie') => {
    const doc = documents?.find(d => d.document_type === type);
    if (!doc) return;

    await verifyDocument.mutateAsync({
      documentId: doc.id,
      status: 'verified'
    });
  };

  const handleReject = async (type: 'id_card' | 'selfie') => {
    const doc = documents?.find(d => d.document_type === type);
    if (!doc) return;

    await verifyDocument.mutateAsync({
      documentId: doc.id,
      status: 'rejected'
    });
  };

  const getDocumentData = (type: 'id_card' | 'selfie') => {
    const doc = documents?.find(d => d.document_type === type);
    if (!doc) return undefined;
    return {
      status: doc.verification_status,
      url: doc.document_url
    };
  };

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  // Use a default verification stage if not provided
  const verificationStage = request.verification_stage || 'id_verification';

  return (
    <div className="space-y-6">
      {/* Client Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informations du client</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="font-medium">{request.full_name}</span>
            </div>
            {request.email && (
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span>{request.email}</span>
              </div>
            )}
            {request.phone && (
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span>{request.phone}</span>
              </div>
            )}
            {request.address && (
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span>{request.address}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Verification Process */}
      <VerificationSteps
        currentStage={verificationStage}
        onVerify={handleVerify}
        onReject={handleReject}
        documents={{
          id_card: getDocumentData('id_card'),
          selfie: getDocumentData('selfie')
        }}
      />

      {/* Document Preview */}
      <div className="grid md:grid-cols-2 gap-4">
        <DocumentPreview
          documentUrl={getDocumentData('id_card')?.url}
          documentType="id_card"
          isVerifying={verificationStage === 'id_verification'}
        />
        <DocumentPreview
          documentUrl={getDocumentData('selfie')?.url}
          documentType="selfie"
          isVerifying={verificationStage === 'selfie_verification'}
        />
      </div>

      {/* Notes and Warnings */}
      {request.notes && request.notes.includes('doublon') && (
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Attention</AlertTitle>
          <AlertDescription>{request.notes}</AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      {verificationStage === 'completed' && (
        <div className="flex justify-end space-x-4">
          <Button
            variant="outline"
            onClick={onReject}
            className="bg-red-50 text-red-700 hover:bg-red-100"
          >
            Rejeter la demande
          </Button>
          <Button
            onClick={onApprove}
            className="bg-green-600 text-white hover:bg-green-700"
          >
            Approuver la demande
          </Button>
        </div>
      )}
    </div>
  );
}
