
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

// Update interface to match the API response structure
interface RuleSuggestion {
  id?: number;
  TRADEID?: number;
  MatchStatus?: string;
  RootCause?: string;
  SuggestedAction?: string;
  title?: string;
  description?: string;
  category?: string;
  priority?: 'high' | 'medium' | 'low';
}

interface RuleSuggestionsPanelProps {
  suggestions: RuleSuggestion[];
  isLoading: boolean;
}

const RuleSuggestionsPanel: React.FC<RuleSuggestionsPanelProps> = ({ 
  suggestions, 
  isLoading 
}) => {
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Loading Recommendations...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse"></div>
            <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse"></div>
            <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">AI Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Info className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-500 dark:text-gray-400">
              No recommendations available yet
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Click the "Get Recommendations" button to generate AI-powered suggestions
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Function to determine the priority based on MatchStatus
  const getPriorityFromMatchStatus = (matchStatus: string | undefined): 'high' | 'medium' | 'low' => {
    if (!matchStatus) return 'medium';
    
    const status = matchStatus.toLowerCase();
    if (status.includes('only') || status === 'missing') {
      return 'high';
    } else if (status.includes('break') || status.includes('mismatch')) {
      return 'medium';
    } else {
      return 'low';
    }
  };

  // Function to determine the category based on MatchStatus
  const getCategoryFromMatchStatus = (matchStatus: string | undefined): string => {
    if (!matchStatus) return 'Unclassified';
    
    const status = matchStatus.toLowerCase();
    if (status.includes('price')) {
      return 'Price Issue';
    } else if (status.includes('quantity')) {
      return 'Quantity Issue';
    } else if (status.includes('catalyst_only')) {
      return 'Missing in Impact';
    } else if (status.includes('impact_only')) {
      return 'Missing in Catalyst';
    } else {
      return matchStatus;
    }
  };

  const getPriorityIcon = (suggestion: RuleSuggestion) => {
    // Use existing priority if available, otherwise determine from MatchStatus
    const priority = suggestion.priority || getPriorityFromMatchStatus(suggestion.MatchStatus);
    
    switch(priority) {
      case 'high':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'medium':
        return <Info className="h-5 w-5 text-amber-500" />;
      case 'low':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">AI Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          {suggestions.map((suggestion, index) => (
            <div key={suggestion.TRADEID || suggestion.id || index} className="p-4 border rounded-md bg-white dark:bg-gray-800 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {getPriorityIcon(suggestion)}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    {suggestion.title || `Trade ID: ${suggestion.TRADEID} - ${suggestion.MatchStatus}`}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {suggestion.description || suggestion.RootCause || "No description available"}
                  </p>
                  {suggestion.SuggestedAction && (
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                      <strong>Suggested Action:</strong> {suggestion.SuggestedAction}
                    </p>
                  )}
                  <div className="flex items-center mt-2">
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded-full">
                      {suggestion.category || getCategoryFromMatchStatus(suggestion.MatchStatus)}
                    </span>
                    {suggestion.TRADEID && (
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 rounded-full ml-2">
                        Trade ID: {suggestion.TRADEID}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RuleSuggestionsPanel;
