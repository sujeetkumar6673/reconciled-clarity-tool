
import { useState } from 'react';
import { MessageSquare, CornerUpRight, Lightbulb, CheckCircle, Copy, Brain, MailPlus, ArrowRight, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Mock data for AI insights
const mockInsights = [
  {
    id: 1,
    title: 'Balance Discrepancy Analysis',
    description: 'We\'ve analyzed the $1,240.50 discrepancy between your GL and bank statement.',
    category: 'analysis',
    content: `The balance discrepancy of $1,240.50 appears to be caused by:

1. Three outstanding checks (numbers #2205, #2208, #2212) totaling $875.25 that have not cleared the bank.
2. Two electronic payments recorded in the GL but not yet processed by the bank ($365.25).

**Recommendation**: Record these as reconciling items on your bank reconciliation and monitor for clearing in the next statement cycle.`,
  },
  {
    id: 2,
    title: 'Duplicate Transaction Alert',
    description: 'Our algorithms detected duplicate payment for invoice #INV-2023-0542.',
    category: 'alert',
    content: `Invoice #INV-2023-0542 was paid twice:
- First payment: May 12, 2023 ($458.75)
- Second payment: May 17, 2023 ($458.75)

**Impact**: Overpayment of $458.75 to vendor "OfficeSupplyCo"

**Recommendation**: Contact OfficeSupplyCo to request a refund or credit for future purchases. Update your accounts payable process to include a duplicate payment check.`,
  },
  {
    id: 3,
    title: 'Process Improvement Suggestion',
    description: 'We\'ve identified patterns that could be optimized in your reconciliation workflow.',
    category: 'suggestion',
    content: `Based on the reconciliation patterns in your data, we've identified these improvement opportunities:

1. **Weekly Reconciliation**: Switching from monthly to weekly reconciliations could reduce the average discrepancy amount by 64% based on your historical data.

2. **Missing Documentation**: 23% of reconciliation issues are due to missing or incomplete documentation.

3. **Approval Workflow**: Implementing a dual-approval process for transactions above $1,000 could prevent 88% of the high-impact reconciliation issues.

**Recommendation**: Implement weekly reconciliation checks and enhance your documentation requirements.`,
  },
  {
    id: 4,
    title: 'Training Opportunity Identified',
    description: 'We\'ve identified specific training needs based on reconciliation patterns.',
    category: 'training',
    content: `Our analysis indicates that most reconciliation errors (72%) originate from transactions classified under "Prepaid Expenses" and "Accrued Liabilities".

This suggests that team members may benefit from additional training on:
1. Proper timing of expense recognition
2. Accrual accounting principles
3. Documentation requirements for prepaid items

**Recommendation**: Schedule a focused training session covering these topics with the accounting team.`,
  },
  {
    id: 5,
    title: 'Regulatory Compliance Alert',
    description: 'Potential compliance issues identified in reconciliation data.',
    category: 'compliance',
    content: `We've detected patterns that may indicate compliance risks:

1. Several transactions with round dollar amounts ($5,000, $10,000) were split into multiple smaller transactions on the same day.

2. Three transactions exceeding the $10,000 reporting threshold lack proper documentation.

**Risk**: These patterns could trigger regulatory scrutiny.

**Recommendation**: Review your transaction approval process and documentation requirements for large transactions. Consider implementing automated alerts for transactions that approach reporting thresholds.`,
  }
];

// Mock actions
const suggestedActions = [
  {
    id: 1,
    title: 'Request Refund for Duplicate Payment',
    description: 'Send automated email to vendor requesting refund for duplicate invoice payment',
    icon: MailPlus,
    actionType: 'email',
  },
  {
    id: 2,
    title: 'Generate Reconciliation Report',
    description: 'Create detailed reconciliation report with all identified discrepancies',
    icon: Download,
    actionType: 'report',
  },
  {
    id: 3,
    title: 'Schedule Training Session',
    description: 'Book training session on proper expense classification for accounting team',
    icon: Brain,
    actionType: 'training',
  },
];

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
                {mockInsights.map((insight) => (
                  <div
                    key={insight.id}
                    className={cn(
                      "p-3 rounded-lg cursor-pointer transition-all duration-200 flex items-start",
                      selectedInsight.id === insight.id
                        ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800"
                    )}
                    onClick={() => setSelectedInsight(insight)}
                  >
                    <div className="mr-3 mt-1">
                      {renderInsightIcon(insight.category)}
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">{insight.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-center pt-4">
              <Button 
                variant="outline" 
                onClick={handleGenerateMoreInsights}
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
        </div>

        {/* Right column - Selected insight + actions */}
        <div className="lg:col-span-2 space-y-6 animate-fade-in animate-delay-200">
          {/* Selected insight */}
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-xl">
                  {renderInsightIcon(selectedInsight.category)}
                  <span className="ml-2">{selectedInsight.title}</span>
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopyInsight}
                  className="h-8 w-8"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription className="mt-1">
                {selectedInsight.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 my-2">
                <div className="whitespace-pre-line text-sm">
                  {selectedInsight.content}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Suggested actions */}
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Suggested Actions</CardTitle>
              <CardDescription>
                Recommended next steps based on our analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {suggestedActions.map(action => (
                <div key={action.id} className="flex items-start bg-white dark:bg-gray-900 p-4 rounded-lg border">
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-4 shrink-0">
                    <action.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{action.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {action.description}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="shrink-0 h-8 w-8 mt-1"
                    onClick={() => handleExecuteAction(action.actionType)}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
              >
                View More Actions
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InsightsPanel;
