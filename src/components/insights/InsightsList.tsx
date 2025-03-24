
import React, { useEffect } from 'react';
import { Brain, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import InsightItem from './InsightItem';
import { ScrollArea } from '@/components/ui/scroll-area';

interface InsightsListProps {
  insights: Array<{
    id: number;
    title: string;
    description: string;
    category: string;
    content?: string;
  }>;
  selectedInsightId: number | null;
  onSelectInsight: (insight: any) => void;
  onGenerateMore: () => void;
  loading: boolean;
  totalAnomalies?: number;
}

const InsightsList: React.FC<InsightsListProps> = ({
  insights,
  selectedInsightId,
  onSelectInsight,
  onGenerateMore,
  loading,
  totalAnomalies = 0
}) => {
  // Log props changes for debugging
  useEffect(() => {
    console.log('InsightsList received props:', {
      insightsCount: insights.length,
      selectedInsightId,
      loading,
      totalAnomalies
    });
  }, [insights, selectedInsightId, loading, totalAnomalies]);

  return (
    <Card className="glass-card h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Brain className="h-5 w-5 mr-2 text-blue-500" />
          AI Insights
        </CardTitle>
        <CardDescription>
          {insights.length > 0 
            ? `Showing ${insights.length} insights with ${totalAnomalies} total anomalies`
            : 'No insights available yet - generate some to get started'}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="px-6 h-[400px]">
          <div className="space-y-2">
            {insights.length > 0 ? (
              insights.map((insight) => (
                <InsightItem
                  key={`insight-${insight.id}`}
                  insight={insight}
                  isSelected={selectedInsightId === insight.id}
                  onSelect={() => onSelectInsight(insight)}
                />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No insights available. Click the button below to generate insights.
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex justify-center pt-4">
        <Button 
          variant="outline" 
          onClick={onGenerateMore}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Generating Insights...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              {insights.length > 0 ? 'Generate More Insights' : 'Generate Insights'}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default InsightsList;
