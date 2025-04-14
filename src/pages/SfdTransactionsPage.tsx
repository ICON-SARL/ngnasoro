
import React, { useState, useEffect } from 'react';
import { AgencyHeader } from '@/components/AgencyHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TransactionMonitoring } from '@/components/TransactionMonitoring';

const SfdTransactionsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AgencyHeader />
      
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold mb-6">Transactions SFD</h1>
        
        <Card>
          <CardContent className="p-6">
            <TransactionMonitoring />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SfdTransactionsPage;
