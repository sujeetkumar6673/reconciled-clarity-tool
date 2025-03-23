
import { useState } from 'react';
import { toast } from 'sonner';
import { AnomalyItem, InsightResponse } from '@/types/anomaly';
import { API_BASE_URL, getSeverityByBucketId, getCategoryByBucketId, generateSampleRecordsFromCompanies } from '@/utils/anomalyUtils';
import { mockInsightsData } from '@/data/mockAnomalyData';

interface UseAnomalyInsightsProps {
  onAnomalyInsightsReceived?: (anomalies: AnomalyItem[]) => void;
}

export const useAnomalyInsights = ({ onAnomalyInsightsReceived }: UseAnomalyInsightsProps = {}) => {
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [insightsData, setInsightsData] = useState<InsightResponse[]>([]);

  // Fallback function for mock insights in case of API failure
  const fallbackToMockInsights = () => {
    if (!onAnomalyInsightsReceived) return;
    
    console.log('Using mock insights data as fallback');
    
    // Use the mock data as a fallback
    const anomalyItems: AnomalyItem[] = mockInsightsData.map((insight, index) => {
      return {
        id: index + 1,
        title: insight.bucket_description,
        description: `Bucket ${insight.bucket_id}: ${insight.root_cause}`,
        severity: getSeverityByBucketId(insight.bucket_id),
        category: getCategoryByBucketId(insight.bucket_id),
        date: new Date().toISOString().split('T')[0],
        impact: `$${(Math.random() * 10000 + 500).toFixed(2)}`,
        status: Math.random() > 0.8 ? 'resolved' : 'unresolved',
        bucket: `Bucket ${insight.bucket_id}: ${insight.bucket_description}`,
        anomalyCount: insight.anomaly_count,
        rootCauses: [insight.root_cause],
        suggestedActions: [insight.recommendation],
        sampleRecords: generateSampleRecordsFromCompanies(insight.sample_companies)
      };
    });
    
    setInsightsData(mockInsightsData);
    onAnomalyInsightsReceived(anomalyItems);
    toast.success('AI insights generated using fallback data!');
  };

  const generateInsights = async () => {
    setIsGeneratingInsights(true);
    
    try {
      toast.info('Generating detailed AI insights...');
      
      // Add a timeout to the fetch to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout
      
      // Call the real API endpoint with error handling
      console.log('Fetching insights from API:', `${API_BASE_URL}/insights`);
      
      // Using fetch with timeout
      const response = await fetch(`${API_BASE_URL}/insights`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        }
      });
      
      clearTimeout(timeoutId);
      
      console.log('API response status:', response.status);
      
      if (!response.ok) {
        let errorMessage = `Error ${response.status}: ${response.statusText}`;
        
        // Try to get more detailed error from response
        try {
          const errorData = await response.json();
          if (errorData.detail) {
            errorMessage = errorData.detail;
          }
        } catch (e) {
          // If we can't parse the error response, just use the status text
        }
        
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      console.log('AI insights response:', result);
      
      // Process the insights data
      const insightsData = result.insights || [];
      setInsightsData(insightsData);
      
      // If no insights data is returned, fallback to mock data
      if (!insightsData || insightsData.length === 0) {
        console.warn('No insights data returned from API, using fallback data');
        fallbackToMockInsights();
        return;
      }
      
      // If onAnomalyInsightsReceived is provided, convert the insights data to AnomalyItem format
      if (onAnomalyInsightsReceived && insightsData.length > 0) {
        const anomalyItems: AnomalyItem[] = insightsData.map((insight: InsightResponse, index: number) => {
          return {
            id: index + 1,
            title: insight.bucket_description,
            description: `Bucket ${insight.bucket_id}: ${insight.root_cause}`,
            severity: getSeverityByBucketId(insight.bucket_id),
            category: getCategoryByBucketId(insight.bucket_id),
            date: new Date().toISOString().split('T')[0],
            impact: `$${(Math.random() * 10000 + 500).toFixed(2)}`,
            status: Math.random() > 0.8 ? 'resolved' : 'unresolved',
            bucket: `Bucket ${insight.bucket_id}: ${insight.bucket_description}`,
            anomalyCount: insight.anomaly_count,
            rootCauses: [insight.root_cause],
            suggestedActions: [insight.recommendation],
            sampleRecords: generateSampleRecordsFromCompanies(insight.sample_companies)
          };
        });
        
        onAnomalyInsightsReceived(anomalyItems);
      }
      
      toast.success('AI insights generated successfully!');
    } catch (error) {
      console.error('Insights generation error:', error);
      
      // Check for specific error types and display appropriate messages
      if (error.name === 'AbortError') {
        toast.error('Insights generation timed out. Using fallback data.');
      } else if (error instanceof TypeError && error.message === 'Failed to fetch') {
        toast.error('Network error: Cannot connect to the server. Using fallback data.');
      } else {
        toast.error(`Failed to generate insights: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      // Fallback to mock data in case of any error
      fallbackToMockInsights();
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  return {
    isGeneratingInsights,
    generateInsights,
    insightsData
  };
};
