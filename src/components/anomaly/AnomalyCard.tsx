
import React from 'react';
import { Calendar, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface AnomalyItem {
  id: number;
  title: string;
  description: string;
  severity: string;
  category: string;
  date: string;
  impact: string;
  status: string;
}

interface AnomalyCardProps {
  anomaly: AnomalyItem;
  getCategoryIcon: (category: string) => JSX.Element;
  getSeverityColor: (severity: string) => string;
}

const AnomalyCard: React.FC<AnomalyCardProps> = ({ 
  anomaly, 
  getCategoryIcon, 
  getSeverityColor 
}) => {
  return (
    <div 
      key={anomaly.id}
      className="p-4 rounded-lg border bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium flex items-center">
            {getCategoryIcon(anomaly.category)}
            <span className="ml-2">{anomaly.title}</span>
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {anomaly.description}
          </p>
        </div>
        <Badge 
          className={cn(
            "ml-2",
            getSeverityColor(anomaly.severity)
          )}
        >
          {anomaly.severity} priority
        </Badge>
      </div>
      <div className="mt-3 pt-3 border-t flex items-center justify-between text-sm">
        <div className="flex items-center gap-3">
          <span className="flex items-center">
            <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
            {anomaly.date}
          </span>
          <span className="flex items-center">
            <DollarSign className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
            {anomaly.impact}
          </span>
        </div>
        <Badge variant={anomaly.status === 'resolved' ? 'outline' : 'destructive'}>
          {anomaly.status}
        </Badge>
      </div>
    </div>
  );
};

export default AnomalyCard;
