import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLoanSchedule } from '@/hooks/useLoanSchedule';
import { ScheduleInstallmentItem } from './ScheduleInstallmentItem';
import { Loader2 } from 'lucide-react';

interface LoanScheduleCardProps {
  loanId: string;
}

export const LoanScheduleCard: React.FC<LoanScheduleCardProps> = ({ loanId }) => {
  const {
    schedule,
    isLoading,
    totalInstallments,
    paidInstallments,
    overdueInstallments,
    progressPercentage,
  } = useLoanSchedule(loanId);

  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');

  const filteredSchedule = schedule.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'paid') return item.status === 'paid';
    if (filter === 'pending') return item.status === 'pending' || item.status === 'partially_paid';
    if (filter === 'overdue') return item.status === 'overdue';
    return true;
  });

  if (isLoading) {
    return (
      <Card className="border-2 border-border">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!schedule || schedule.length === 0) {
    return (
      <Card className="border-2 border-border">
        <CardContent className="py-8 text-center text-muted-foreground">
          Aucun échéancier disponible pour ce prêt
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-border">
      <CardHeader className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg">Échéancier de remboursement</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {totalInstallments} échéances au total
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant={overdueInstallments > 0 ? 'destructive' : 'default'}>
              {overdueInstallments > 0 ? `${overdueInstallments} en retard` : 'À jour'}
            </Badge>
          </div>
        </div>

        {/* Barre de progression globale */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {paidInstallments} / {totalInstallments} échéances payées
            </span>
            <span className="font-semibold">{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
        </div>

        {/* Filtres */}
        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">Toutes</TabsTrigger>
            <TabsTrigger value="paid">Payées</TabsTrigger>
            <TabsTrigger value="pending">À venir</TabsTrigger>
            <TabsTrigger value="overdue">Retard</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent>
        {/* Timeline des échéances */}
        <div className="space-y-2">
          {filteredSchedule.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              Aucune échéance dans cette catégorie
            </p>
          ) : (
            filteredSchedule.map((item, index) => (
              <ScheduleInstallmentItem
                key={item.id}
                schedule={item}
                isLast={index === filteredSchedule.length - 1}
                loanId={loanId}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
