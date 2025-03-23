
import { useState } from 'react';
import { Lightbulb, MessageSquare, Brain, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { mockInsights, suggestedActions } from '@/data/insightsData';
import InsightsList from './insights/InsightsList';
import InsightContent from './insights/InsightContent';
import ActionsList from './insights/ActionsList';

const InsightsPanel = () => {
  const [selectedInsight, setSelectedInsight] = useState(mockInsights[0]);
  const [loading, setLoading] = useState(false);

  const handleCopyInsight = () => {
    navigator.clipboard.writeText(selectedInsight.content);
    toast.success('Insight copied to clipboard');
  };

  const handleGenerateMoreInsights = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast.success('New insights generated');
    }, 2000);
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
            insights={mockInsights}
            selectedInsightId={selectedInsight.id}
            onSelectInsight={setSelectedInsight}
            onGenerateMore={handleGenerateMoreInsights}
            loading={loading}
          />
        </div>

        {/* Right column - Selected insight + actions */}
        <div className="lg:col-span-2 space-y-6 animate-fade-in animate-delay-200">
          {/* Selected insight */}
          <InsightContent
            insight={selectedInsight}
            renderInsightIcon={renderInsightIcon}
            onCopy={handleCopyInsight}
          />

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
