import { Card, CardContent } from './card';

export function SkeletonCard() {
  return (
    <Card className="overflow-hidden border-border/50">
      <CardContent className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="flex gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-muted to-muted/60 rounded-2xl" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gradient-to-r from-muted to-muted/60 rounded w-3/4" />
              <div className="h-3 bg-gradient-to-r from-muted to-muted/60 rounded w-1/2" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-gradient-to-r from-muted to-muted/60 rounded w-full" />
            <div className="h-3 bg-gradient-to-r from-muted to-muted/60 rounded w-5/6" />
          </div>
          <div className="flex gap-2">
            <div className="h-6 bg-gradient-to-r from-muted to-muted/60 rounded-full w-20" />
            <div className="h-6 bg-gradient-to-r from-muted to-muted/60 rounded-full w-24" />
          </div>
          <div className="h-10 bg-gradient-to-r from-muted to-muted/60 rounded-xl w-full" />
        </div>
      </CardContent>
    </Card>
  );
}
