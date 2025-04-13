
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';

const SfdsList: React.FC = () => {
  const { sfdAccounts, isLoading } = useSfdAccounts();
  
  const sfdData = [
    { id: 'troisieme-sfd', name: 'Troisième SFD', code: 'SFD3', region: 'Sikasso' },
    { id: 'caurie-mf', name: 'CAURIE-MF', code: 'CAURIE', region: 'Bamako' },
    { id: 'nyesigiso', name: 'Nyèsigiso', code: 'NYE', region: 'Ségou' },
    { id: 'kafo-jiginew', name: 'Kafo Jiginew', code: 'KAFO', region: 'Koulikoro' },
    { id: 'soro-yiriwaso', name: 'Soro Yiriwaso', code: 'SORO', region: 'Bamako' },
    { id: 'miselini', name: 'Miselini', code: 'MISE', region: 'Sikasso' }
  ];
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#0D6A51]"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-1">
      <h2 className="text-xl font-semibold mb-4">Mes SFDs</h2>
      {sfdData.map((sfd) => (
        <Card key={sfd.id} className="mb-3 border-gray-100 hover:border-[#0D6A51]/30 transition-colors overflow-hidden">
          <CardContent className="p-0">
            <Link to={`/mobile-flow/sfd/${sfd.id}`} className="flex items-center justify-between p-4">
              <div>
                <h3 className="font-medium text-lg">{sfd.name}</h3>
                <p className="text-gray-500 text-sm">{sfd.code}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SfdsList;
