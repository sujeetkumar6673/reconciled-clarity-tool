
import React from 'react';
import { AlertTriangle, DollarSign, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface AnomalySummaryCardsProps {
  totalAnomalies: number;
  totalImpact: string;
  resolutionRate: string;
  resolvedCount: number;
  totalCount: number;
}

const AnomalySummaryCards: React.FC<AnomalySummaryCardsProps> = ({
  totalAnomalies,
  totalImpact,
  resolutionRate,
  resolvedCount,
  totalCount
}) => {
  // Log when the component renders with new props
  console.log('AnomalySummaryCards rendering with props:', { 
    totalAnomalies, totalImpact, resolutionRate, resolvedCount, totalCount 
  });
  
  return (
    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 animate-fade-in" data-testid="anomaly-summary-cards">
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
            Total Anomalies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold" data-testid="anomaly-count">{totalAnomalies}</div>
          <p className="text-sm text-muted-foreground">Across all accounts</p>
        </CardContent>
      </Card>
      
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-blue-500" />
            Total Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold" data-testid="impact-value">{totalImpact}</div>
          <p className="text-sm text-muted-foreground">Combined financial impact</p>
        </CardContent>
      </Card>
      
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Clock className="h-5 w-5 mr-2 text-green-500" />
            Resolution Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{resolutionRate}</div>
          <p className="text-sm text-muted-foreground">{resolvedCount} of {totalCount} anomalies resolved</p>
        </CardContent>
      </Card>
    </div>
  );
};

// Remove React.memo to ensure updates always propagate
export default AnomalySummaryCards;
