
import React from 'react';
import { Brain, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import InsightItem from './InsightItem';

interface InsightsListProps {
  insights: Array<{
    id: number;
    title: string;
    description: string;
    category: string;
    content: string;
  }>;
  selectedInsightId: number;
  onSelectInsight: (insight: any) => void;
  onGenerateMore: () => void;
  loading: boolean;
}

const InsightsList: React.FC<InsightsListProps> = ({
  insights,
  selectedInsightId,
  onSelectInsight,
  onGenerateMore,
  loading
}) => {
  return (
    <Card className="glass-card h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Brain className="h-5 w-5 mr-2 text-blue-500" />
          AI Insights
        </CardTitle>
        <CardDescription>
          Select an insight to view details
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-2 px-6">
          {insights.map((insight) => (
            <InsightItem
              key={insight.id}
              insight={insight}
              isSelected={selectedInsightId === insight.id}
              onSelect={() => onSelectInsight(insight)}
            />
          ))}
        </div>
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
              Generate More Insights
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default InsightsList;
