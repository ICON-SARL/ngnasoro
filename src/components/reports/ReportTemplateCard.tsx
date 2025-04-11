
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Calendar, Clock, FileText } from 'lucide-react';

interface ReportTemplate {
  id: number;
  title: string;
  description: string;
  lastGenerated?: string;
  downloadCount: number;
  frequency: string;
  icon: 'calendar' | 'file' | 'clock';
}

interface ReportTemplateCardProps {
  template: ReportTemplate;
}

export const ReportTemplateCard: React.FC<ReportTemplateCardProps> = ({ template }) => {
  const getIcon = () => {
    switch (template.icon) {
      case 'calendar':
        return <Calendar className="h-10 w-10 text-blue-500" />;
      case 'clock':
        return <Clock className="h-10 w-10 text-amber-500" />;
      case 'file':
      default:
        return <FileText className="h-10 w-10 text-green-500" />;
    }
  };
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="h-12 w-12 flex items-center justify-center rounded-full bg-muted">
            {getIcon()}
          </div>
          <div className="space-y-2">
            <h3 className="font-medium leading-none">{template.title}</h3>
            <p className="text-sm text-muted-foreground">{template.description}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
          <div>
            <span className="text-muted-foreground">Fréquence:</span>
            <p>{template.frequency}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Téléchargements:</span>
            <p>{template.downloadCount}</p>
          </div>
          {template.lastGenerated && (
            <div className="col-span-2">
              <span className="text-muted-foreground">Dernière génération:</span>
              <p>{template.lastGenerated}</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <Button className="w-full">
          <Download className="h-4 w-4 mr-2" />
          Générer rapport
        </Button>
      </CardFooter>
    </Card>
  );
};
