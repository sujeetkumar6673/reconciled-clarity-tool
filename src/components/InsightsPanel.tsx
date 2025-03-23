
import { useState, useEffect } from 'react';
import { Lightbulb, MessageSquare, Brain, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { mockInsights, suggestedActions } from '@/data/insightsData';
import InsightsList from './insights/InsightsList';
import InsightContent from './insights/InsightContent';
import ActionsList from './insights/ActionsList';
import { useAnomalyInsights } from '@/hooks/useAnomalyInsights';
import { AnomalyItem } from '@/types/anomaly';

const InsightsPanel = () => {
  const [insights, setInsights] = useState(mockInsights);
  const [selectedInsight, setSelectedInsight] = useState(mockInsights[0]);
  const [totalAnomalies, setTotalAnomalies] = useState(0);
  
  const { 
    isGeneratingInsights, 
    generateInsights, 
    totalAnomalies: apiTotalAnomalies 
  } = useAnomalyInsights({
    onAnomalyInsightsReceived: (anomalies: AnomalyItem[]) => {
      console.log(`Received ${anomalies.length} anomaly insights for display`);
      
      // Use the total from the API response instead of calculating it
      setTotalAnomalies(apiTotalAnomalies);
      
      // Convert AnomalyItems to the insight format needed for display
      const formattedInsights = anomalies.map(anomaly => ({
        id: anomaly.id,
        title: anomaly.title,
        description: anomaly.description,
        category: anomaly.category,
        content: `
Bucket ID: ${anomaly.bucket?.split(':')[0].replace('Bucket ', '')}
Anomaly Count: ${anomaly.anomalyCount || 0}
Severity: ${anomaly.severity}
Impact: ${anomaly.impact}

Root Cause:
${anomaly.rootCauses?.join('\n') || 'No root cause analysis available'}

Suggested Actions:
${anomaly.suggestedActions?.join('\n') || 'No suggested actions available'}

Sample Companies:
${anomaly.sampleRecords?.map(record => record.company).join(', ') || 'No sample companies available'}
        `.trim()
      }));
      
      if (formattedInsights.length > 0) {
        setInsights(formattedInsights);
        // Set the first insight as selected if available
        setSelectedInsight(formattedInsights[0]);
      }
    }
  });

  // Update total anomalies whenever apiTotalAnomalies changes
  useEffect(() => {
    if (apiTotalAnomalies > 0) {
      setTotalAnomalies(apiTotalAnomalies);
    }
  }, [apiTotalAnomalies]);

  const handleCopyInsight = () => {
    navigator.clipboard.writeText(selectedInsight.content);
    toast.success('Insight copied to clipboard');
  };

  const handleGenerateMoreInsights = () => {
    generateInsights();
  };

  const handleExecuteAction = (actionType: string) => {
    toast.success(`Action "${actionType}" initiated`);
  };

  const renderInsightIcon = (category: string) => {
    switch (category) {
      case 'analysis':
        return <Lightbulb className="h-5 w-5 text-blue-500" />;
      case 'alert':
        return <MessageSquare className="h-5 w-5 text-red-500" />;
      case 'suggestion':
        return <Brain className="h-5 w-5 text-purple-500" />;
      case 'training':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'compliance':
        return <CheckCircle className="h-5 w-5 text-orange-500" />;
      case 'balance':
      case 'missing':
      case 'timing':
      case 'duplicate':
      case 'unclassified':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      default:
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <div className="mb-8">
        <h2 className="text-2xl font-medium text-center mb-2">AI-Powered Insights</h2>
        <p className="text-muted-foreground text-center max-w-2xl mx-auto">
          Get intelligent recommendations and insights for your reconciliation data
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Insight list */}
        <div className="lg:col-span-1 animate-fade-in animate-delay-100">
          <InsightsList 
            insights={insights}
            selectedInsightId={selectedInsight?.id}
            onSelectInsight={setSelectedInsight}
            onGenerateMore={handleGenerateMoreInsights}
            loading={isGeneratingInsights}
            totalAnomalies={totalAnomalies}
          />
        </div>

        {/* Right column - Selected insight + actions */}
        <div className="lg:col-span-2 space-y-6 animate-fade-in animate-delay-200">
          {/* Selected insight */}
          {selectedInsight && (
            <InsightContent
              insight={selectedInsight}
              renderInsightIcon={renderInsightIcon}
              onCopy={handleCopyInsight}
            />
          )}

          {/* Suggested actions */}
          <ActionsList 
            actions={suggestedActions}
            onExecuteAction={handleExecuteAction}
          />
        </div>
      </div>
    </div>
  );
};

export default InsightsPanel;
