
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

interface RuleSuggestion {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
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

  const getPriorityIcon = (priority: string) => {
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
          {suggestions.map((suggestion) => (
            <div key={suggestion.id} className="p-4 border rounded-md bg-white dark:bg-gray-800 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {getPriorityIcon(suggestion.priority)}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">{suggestion.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{suggestion.description}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded-full">
                      {suggestion.category}
                    </span>
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
