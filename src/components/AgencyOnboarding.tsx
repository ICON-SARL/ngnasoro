import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Plus, CheckCircle2, XCircle, Eye, Search } from 'lucide-react';

export const AgencyOnboarding = () => {
  const [isAddingAgency, setIsAddingAgency] = useState(false);
  const form = useForm({
    defaultValues: {
      name: '',
      location: '',
      director: '',
      email: '',
      phone: '',
      licenseNumber: '',
    }
  });

  const agencies = [
    { 
      id: 1, 
      name: 'SFD Bamako Central', 
      location: 'Bamako', 
      director: 'Amadou Traoré', 
      kyc: 'Validé', 
      status: 'active'
    },
    { 
      id: 2, 
      name: 'SFD Kayes Rural', 
      location: 'Kayes', 
      director: 'Fatoumata Diallo', 
      kyc: 'En attente', 
      status: 'pending'
    },
    { 
      id: 3, 
      name: 'SFD Ségou Nord', 
      location: 'Ségou', 
      director: 'Ibrahim Kéita', 
      kyc: 'Validé', 
      status: 'active'
    },
    { 
      id: 4, 
      name: 'SFD Sikasso Est', 
      location: 'Sikasso', 
      director: 'Mariam Coulibaly', 
      kyc: 'Rejeté', 
      status: 'rejected'
    },
  ];

  const onSubmit = (data: any) => {
    console.log('Form submitted:', data);
    setIsAddingAgency(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">Gestion des Agences</h2>
          <p className="text-sm text-muted-foreground">Onboarding et vérification KYC des agences SFD</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher une agence..."
              className="pl-8 w-64"
            />
          </div>
          <Button onClick={() => setIsAddingAgency(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Agence
          </Button>
        </div>
      </div>
      
      {isAddingAgency ? (
        <div className="bg-gray-50 p-4 rounded-lg border mb-6">
          <h3 className="text-lg font-medium mb-4">Ajouter une nouvelle agence</h3>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom de l'agence</FormLabel>
                      <FormControl>
                        <Input placeholder="SFD Nom Agence" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Localisation</FormLabel>
                      <FormControl>
                        <Input placeholder="Ville, Région" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="director"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Directeur</FormLabel>
                      <FormControl>
                        <Input placeholder="Nom et Prénom" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@agence.ml" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone</FormLabel>
                      <FormControl>
                        <Input placeholder="+223 70 00 00 00" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="licenseNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Numéro de Licence</FormLabel>
                      <FormControl>
                        <Input placeholder="SFD-2023-0000" {...field} />
                      </FormControl>
                      <FormDescription>
                        Numéro d'agrément officiel
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddingAgency(false)}
                >
                  Annuler
                </Button>
                <Button type="submit">
                  Enregistrer l'Agence
                </Button>
              </div>
            </form>
          </Form>
        </div>
      ) : null}
      
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Localisation</TableHead>
              <TableHead>Directeur</TableHead>
              <TableHead>Statut KYC</TableHead>
              <TableHead>État</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {agencies.map((agency) => (
              <TableRow key={agency.id}>
                <TableCell className="font-medium">{agency.name}</TableCell>
                <TableCell>{agency.location}</TableCell>
                <TableCell>{agency.director}</TableCell>
                <TableCell>
                  {agency.kyc === 'Validé' && (
                    <Badge variant="outline" className="bg-green-50 text-green-600 hover:bg-green-50">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      {agency.kyc}
                    </Badge>
                  )}
                  {agency.kyc === 'En attente' && (
                    <Badge variant="outline" className="bg-amber-50 text-amber-600 hover:bg-amber-50">
                      {agency.kyc}
                    </Badge>
                  )}
                  {agency.kyc === 'Rejeté' && (
                    <Badge variant="outline" className="bg-red-50 text-red-600 hover:bg-red-50">
                      <XCircle className="h-3 w-3 mr-1" />
                      {agency.kyc}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {agency.status === 'active' && (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      Actif
                    </Badge>
                  )}
                  {agency.status === 'pending' && (
                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                      En attente
                    </Badge>
                  )}
                  {agency.status === 'rejected' && (
                    <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                      Rejeté
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    Détails
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
