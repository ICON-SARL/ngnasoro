
import React from 'react';
import { 
  FileText, 
  FileCheck, 
  FileX, 
  Download, 
  Eye, 
  Upload,
  FileQuestion
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface LoanDocumentsProps {
  loanId: string;
}

export const LoanDocuments: React.FC<LoanDocumentsProps> = ({ loanId }) => {
  // Cette fonction sera implémentée plus tard pour récupérer les documents du prêt
  // Pour l'instant, nous utilisons des données fictives
  const documents = [
    { 
      id: '1', 
      name: 'Contrat de prêt', 
      type: 'contract', 
      status: 'verified', 
      date: '2023-10-15',
      url: '#'
    },
    { 
      id: '2', 
      name: 'Pièce d\'identité', 
      type: 'id', 
      status: 'verified', 
      date: '2023-10-14',
      url: '#'
    },
    { 
      id: '3', 
      name: 'Justificatif de revenu', 
      type: 'income', 
      status: 'pending', 
      date: '2023-10-14',
      url: '#'
    },
    { 
      id: '4', 
      name: 'Garanties', 
      type: 'collateral', 
      status: 'rejected', 
      date: '2023-10-13',
      url: '#'
    }
  ];

  if (documents.length === 0) {
    return (
      <div className="text-center py-8">
        <FileQuestion className="h-12 w-12 mx-auto text-gray-300 mb-3" />
        <h3 className="text-lg font-medium mb-1">Aucun document</h3>
        <p className="text-muted-foreground mb-4">
          Aucun document n'a encore été ajouté pour ce prêt.
        </p>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Ajouter un document
        </Button>
      </div>
    );
  }

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'contract':
        return <FileText className="h-8 w-8 text-blue-500" />;
      case 'id':
        return <FileText className="h-8 w-8 text-amber-500" />;
      case 'income':
        return <FileText className="h-8 w-8 text-green-500" />;
      case 'collateral':
        return <FileText className="h-8 w-8 text-purple-500" />;
      default:
        return <FileText className="h-8 w-8 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Vérifié</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">En attente</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejeté</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <FileCheck className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <FileText className="h-5 w-5 text-yellow-500" />;
      case 'rejected':
        return <FileX className="h-5 w-5 text-red-500" />;
      default:
        return <FileQuestion className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Documents du prêt</h3>
        <Button size="sm">
          <Upload className="mr-2 h-4 w-4" />
          Ajouter
        </Button>
      </div>

      <div className="space-y-4">
        {documents.map((doc) => (
          <div 
            key={doc.id} 
            className="flex items-center justify-between border p-4 rounded-md"
          >
            <div className="flex items-center gap-4">
              {getDocumentIcon(doc.type)}
              <div>
                <h4 className="font-medium">{doc.name}</h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {getStatusIcon(doc.status)}
                  <span>
                    {getStatusBadge(doc.status)} • Ajouté le {new Date(doc.date).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8">
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
