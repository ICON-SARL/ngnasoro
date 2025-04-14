
"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { SfdClient } from '@/types/sfdClients';
import { ArrowLeft, TrendingUp, CreditCard, Plus, ArrowUpDown } from 'lucide-react';

const MobileSavingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [sfd, setSfd] = useState('');
  const [status, setStatus] = useState<'pending' | 'active' | 'inactive'>('pending');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sfds = [
    { id: 'sfd-1', name: 'Microfinance Bamako' },
    { id: 'sfd-2', name: 'Kafo Jiginew' },
    { id: 'sfd-3', name: 'Nyèsigiso' },
  ];

  const mockClient = {
    id: 'client-1',
    full_name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+223 xx xx xx xx',
    sfd_id: 'sfd-1',
    status: 'pending' as const,
    kyc_level: 1,
    created_at: new Date().toISOString(),
    user_id: 'user-1',
    updated_at: new Date().toISOString()
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Demande envoyée",
        description: "Votre demande d'adhésion a été envoyée avec succès. Vous recevrez une notification dès qu'elle sera traitée.",
      });
      navigate('/mobile-flow/loans');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white p-4 shadow-sm">
        <h1 className="text-xl font-semibold">Adhésion à une SFD</h1>
        <p className="text-gray-500 text-sm">
          Remplissez le formulaire ci-dessous pour adhérer à une SFD et commencer à épargner.
        </p>
      </div>

      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
            <CardDescription>
              Entrez vos informations personnelles pour compléter votre demande d'adhésion.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="fullName">Nom complet</Label>
                <Input
                  type="text"
                  id="fullName"
                  placeholder="Votre nom complet"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  placeholder="Votre adresse email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  type="tel"
                  id="phone"
                  placeholder="Votre numéro de téléphone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="sfd">SFD</Label>
                <Select onValueChange={setSfd}>
                  <SelectTrigger id="sfd">
                    <SelectValue placeholder="Sélectionner une SFD" />
                  </SelectTrigger>
                  <SelectContent>
                    {sfds.map((sfdItem) => (
                      <SelectItem key={sfdItem.id} value={sfdItem.id}>
                        {sfdItem.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90" disabled={isSubmitting}>
                {isSubmitting ? 'Envoi en cours...' : 'Envoyer la demande'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-800">Informations importantes</h3>
              <p className="text-sm text-blue-700 mt-1">
                Votre demande sera traitée dans les plus brefs délais. Vous recevrez une notification par email ou SMS une fois votre demande approuvée.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileSavingsPage;
