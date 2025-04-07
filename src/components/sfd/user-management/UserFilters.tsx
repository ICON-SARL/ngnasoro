
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FileDown, Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface UserFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: string | null;
  setStatusFilter: (value: string | null) => void;
  kycFilter: number | null;
  setKycFilter: (value: number | null) => void;
  exportUserData: () => void;
}

export function UserFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  kycFilter,
  setKycFilter,
  exportUserData
}: UserFiltersProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Clients SFD</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0 sm:space-x-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="Rechercher un client..."
              className="pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex space-x-2">
            <Select onValueChange={(value) => setStatusFilter(value === "all" ? null : value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="validated">Actif</SelectItem>
                <SelectItem value="rejected">Inactif</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
              </SelectContent>
            </Select>
            
            <Select onValueChange={(value) => setKycFilter(value === "all" ? null : parseInt(value))}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Niveau KYC" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="0">Niveau 0</SelectItem>
                <SelectItem value="1">Niveau 1</SelectItem>
                <SelectItem value="2">Niveau 2</SelectItem>
                <SelectItem value="3">Niveau 3</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={exportUserData}>
              <FileDown className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
