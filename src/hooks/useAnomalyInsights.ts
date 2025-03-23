
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
    
    onAnomalyInsightsReceived(anomalyItems);
    toast.success('AI insights generated using fallback data!');
  };

  const generateInsights = async () => {
    setIsGeneratingInsights(true);
    
    try {
      toast.info('Generating detailed AI insights...');
      
      // Call the real API endpoint
      const response = await fetch(`${API_BASE_URL}/insights`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('AI insights response:', result);
      
      // Process the insights data
      const insightsData = result.insights || [];
      setInsightsData(insightsData);
      
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
      toast.error(`Failed to generate insights: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Fallback to mock data in case of error
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
