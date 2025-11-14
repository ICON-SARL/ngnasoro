import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Wallet, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  CreditCard,
  PiggyBank,
  Send,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '@/utils/format';

interface MobileClientDashboardProps {
  balance?: number;
  activeLoans?: Array<{
    id: string;
    amount: number;
    remaining_amount: number;
    next_payment_date?: string;
    status: string;
  }>;
  recentTransactions?: Array<{
    id: string;
    type: string;
    amount: number;
    description?: string;
    created_at: string;
  }>;
}

const MobileClientDashboard: React.FC<MobileClientDashboardProps> = ({
  balance = 0,
  activeLoans = [],
  recentTransactions = []
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4 p-4 pb-20">
      {/* Solde Épargne */}
      <Card className="bg-gradient-to-br from-primary to-primary-glow border-0 text-primary-foreground">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Solde Total</p>
              <p className="text-3xl font-bold mt-1">{formatCurrency(balance)}</p>
            </div>
            <Wallet className="h-12 w-12 opacity-80" />
          </div>
          
          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-2 mt-6">
            <Button
              variant="secondary"
              size="sm"
              className="flex flex-col h-auto py-3"
              onClick={() => navigate('/mobile-flow/loans/new')}
            >
              <CreditCard className="h-5 w-5 mb-1" />
              <span className="text-xs">Prêt</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="flex flex-col h-auto py-3"
              onClick={() => navigate('/mobile-flow/savings')}
            >
              <PiggyBank className="h-5 w-5 mb-1" />
              <span className="text-xs">Épargner</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="flex flex-col h-auto py-3"
              onClick={() => navigate('/mobile-flow/transfers')}
            >
              <Send className="h-5 w-5 mb-1" />
              <span className="text-xs">Transférer</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Prêts Actifs */}
      {activeLoans.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Prêts Actifs</CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/mobile-flow/loans')}
              >
                Voir tout
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeLoans.slice(0, 2).map((loan) => (
              <div 
                key={loan.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted/70 transition-colors"
                onClick={() => navigate(`/mobile-flow/loans/${loan.id}`)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <p className="font-medium">Prêt {formatCurrency(loan.amount)}</p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Reste: {formatCurrency(loan.remaining_amount)}
                  </p>
                  {loan.next_payment_date && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Clock className="h-3 w-3" />
                      <span>Prochaine échéance: {new Date(loan.next_payment_date).toLocaleDateString('fr-FR')}</span>
                    </div>
                  )}
                </div>
                <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Transactions Récentes */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Transactions Récentes</CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/mobile-flow/transactions')}
            >
              Voir tout
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Aucune transaction récente</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.slice(0, 5).map((tx) => (
                <div 
                  key={tx.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      tx.amount > 0 ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {tx.amount > 0 ? (
                        <ArrowDownRight className="h-4 w-4 text-green-600" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{tx.type}</p>
                      {tx.description && (
                        <p className="text-xs text-muted-foreground">{tx.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <p className={`font-semibold ${
                    tx.amount > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* État vide si pas de prêts */}
      {activeLoans.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="text-center py-8">
            <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-4">Aucun prêt actif</p>
            <Button onClick={() => navigate('/mobile-flow/loans/new')}>
              Demander un prêt
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MobileClientDashboard;
