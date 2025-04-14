
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTransactionStats } from '@/hooks/useTransactionStats';
import { ArrowDown, ArrowUp, AlertTriangle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TransactionStatsProps {
  period?: 'day' | 'week' | 'month';
  showViewAll?: boolean;
}

export const TransactionStats: React.FC<TransactionStatsProps> = ({ 
  period = 'day',
  showViewAll = true
}) => {
  const { stats, isLoading, refreshStats } = useTransactionStats(period);
  
  const periodLabel = period === 'day' ? '24h' : 
                     period === 'week' ? '7 jours' : '30 jours';
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Aperçu des Transactions</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refreshStats} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          
          {showViewAll && (
            <Button variant="outline" size="sm" asChild>
              <Link to="/sfd-transactions">
                Voir tout
              </Link>
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-muted-foreground">Transactions ({periodLabel})</h3>
            <span className={stats.compareYesterday.countChange >= 0 ? "text-green-500" : "text-red-500"}>
              {stats.compareYesterday.countChange >= 0 ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
            </span>
          </div>
          <p className="text-2xl font-bold mt-1">{stats.totalCount.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.compareYesterday.countChange >= 0 ? '+' : ''}
            {stats.compareYesterday.countChange}% vs période précédente
          </p>
        </Card>
        
        <Card className="p-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-muted-foreground">Volume ({periodLabel})</h3>
            <span className={stats.compareYesterday.volumeChange >= 0 ? "text-green-500" : "text-red-500"}>
              {stats.compareYesterday.volumeChange >= 0 ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
            </span>
          </div>
          <p className="text-2xl font-bold mt-1">
            {(stats.totalVolume / 1000000).toFixed(1)}M FCFA
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.compareYesterday.volumeChange >= 0 ? '+' : ''}
            {stats.compareYesterday.volumeChange}% vs période précédente
          </p>
        </Card>
        
        <Card className="p-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-muted-foreground">Moyenne</h3>
            <span className={stats.compareYesterday.averageChange >= 0 ? "text-green-500" : "text-red-500"}>
              {stats.compareYesterday.averageChange >= 0 ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
            </span>
          </div>
          <p className="text-2xl font-bold mt-1">
            {Math.round(stats.averageAmount).toLocaleString()} FCFA
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.compareYesterday.averageChange >= 0 ? '+' : ''}
            {stats.compareYesterday.averageChange}% vs période précédente
          </p>
        </Card>
        
        <Card className="p-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-muted-foreground">Alertes</h3>
            <span className="text-amber-500">
              <AlertTriangle className="h-4 w-4" />
            </span>
          </div>
          <p className="text-2xl font-bold mt-1">{stats.flaggedCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Nécessitent une vérification</p>
        </Card>
      </div>
    </div>
  );
};
