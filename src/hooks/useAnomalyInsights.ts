
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
  const [totalAnomalies, setTotalAnomalies] = useState<number>(0);
  const [totalImpact, setTotalImpact] = useState<number>(0);

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
    
    const mockTotalAnomalies = anomalyItems.reduce((total, item) => total + (item.anomalyCount || 0), 0);
    setTotalAnomalies(mockTotalAnomalies);
    setInsightsData(mockInsightsData);
    onAnomalyInsightsReceived(anomalyItems);
    toast.success('AI insights generated using fallback data!');
  };

  const generateInsights = async () => {
    setIsGeneratingInsights(true);
    
    try {
      toast.info('Generating detailed AI insights...');
      
      // Increase timeout to prevent hanging requests - 120 seconds (2 minutes)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout (increased from 60)
      
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
      
      // Handle the API response structure correctly
      if (!result) {
        throw new Error('Empty response from insights API');
      }
      
      // Initialize variables for processing the response
      let insightsArray: InsightResponse[] = [];
      let totalAnomaliesCount = 0;
      let totalImpactValue = 0;
      
      // Check if result has the expected structure
      if (result.total_anomalies !== undefined && result.insights && Array.isArray(result.insights)) {
        // This is the new expected format with total_anomalies, total_impact, and insights array
        console.log('Processing structured format with insights array:', result.total_anomalies, 'anomalies');
        insightsArray = result.insights;
        totalAnomaliesCount = result.total_anomalies;
        totalImpactValue = result.total_impact || 0;
      } else if (Array.isArray(result)) {
        // Old format - direct array of insights
        console.log('Processing direct array format');
        insightsArray = result;
        totalAnomaliesCount = result.reduce((total, insight) => total + (insight.anomaly_count || 0), 0);
      } else if (result.message) {
        // Handle case where only a message is returned
        console.log('Response contains only a message:', result.message);
        toast.info(result.message);
        throw new Error('No insights data available in the response');
      } else {
        // Unknown format - log it for debugging
        console.warn('Unexpected insights data format:', result);
        throw new Error('Invalid insights data format received');
      }
      
      console.log(`Processing ${insightsArray.length} insights with total ${totalAnomaliesCount} anomalies`);
      setInsightsData(insightsArray);
      setTotalAnomalies(totalAnomaliesCount);
      setTotalImpact(totalImpactValue);
      
      // If no insights data is returned, fallback to mock data
      if (!insightsArray || insightsArray.length === 0) {
        console.warn('No insights data returned from API, using fallback data');
        fallbackToMockInsights();
        return;
      }
      
      // If onAnomalyInsightsReceived is provided, convert the insights data to AnomalyItem format
      if (onAnomalyInsightsReceived && insightsArray.length > 0) {
        const anomalyItems: AnomalyItem[] = insightsArray.map((insight, index) => {
          return {
            id: index + 1,
            title: insight.bucket_description,
            description: `Bucket ${insight.bucket_id}: ${insight.root_cause}`,
            severity: getSeverityByBucketId(insight.bucket_id),
            category: getCategoryByBucketId(insight.bucket_id),
            date: new Date().toISOString().split('T')[0],
            impact: totalImpactValue ? `$${Math.abs(totalImpactValue).toLocaleString()}` : `$${(Math.random() * 10000 + 500).toFixed(2)}`,
            status: Math.random() > 0.8 ? 'resolved' : 'unresolved',
            bucket: `Bucket ${insight.bucket_id}: ${insight.bucket_description}`,
            anomalyCount: insight.anomaly_count,
            rootCauses: [insight.root_cause],
            suggestedActions: [insight.recommendation],
            sampleRecords: generateSampleRecordsFromCompanies(insight.sample_companies)
          };
        });
        
        // Log the number of anomaly items being passed
        console.log(`Passing ${anomalyItems.length} anomaly items with ${totalAnomaliesCount} total anomalies to callback`);
        onAnomalyInsightsReceived(anomalyItems);
      }
      
      toast.success(`AI insights generated successfully! Found ${insightsArray.length} insight categories with ${totalAnomaliesCount} anomalies.`);
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
    insightsData,
    totalAnomalies,
    totalImpact
  };
};
