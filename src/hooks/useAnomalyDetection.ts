
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { DynamicColumnData } from '@/lib/csv-parser';
import { AnomalyItem, UseAnomalyDetectionProps } from '@/types/anomaly';
import { API_BASE_URL, parseCsvForTable } from '@/utils/anomalyUtils';
import { useAnomalyInsights } from './useAnomalyInsights';
import { mockCsvData } from '@/data/mockAnomalyData';

export const useAnomalyDetection = ({ 
  onAnomalyDataReceived, 
  onAnomalyInsightsReceived 
}: UseAnomalyDetectionProps = {}) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [resultFile, setResultFile] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [hasAnomalies, setHasAnomalies] = useState(false);
  
  const { 
    isGeneratingInsights, 
    generateInsights, 
    insightsData 
  } = useAnomalyInsights({ onAnomalyInsightsReceived });

  // Reset progress when detection starts/stops
  useEffect(() => {
    if (!isDetecting) {
      setProgress(0);
    }
  }, [isDetecting]);
  
  // Simulate progress for better UX during API call
  useEffect(() => {
    let interval: number | undefined;
    
    if (isDetecting && progress < 95) {
      interval = window.setInterval(() => {
        setProgress(prevProgress => {
          // Gradually slow down progress as it gets closer to 95%
          const increment = Math.max(1, Math.floor((95 - prevProgress) / 10));
          return Math.min(95, prevProgress + increment);
        });
      }, 500);
    }
    
    return () => {
      if (interval !== undefined) {
        window.clearInterval(interval);
      }
    };
  }, [isDetecting, progress]);

  const detectAnomalies = async () => {
    setIsDetecting(true);
    setProgress(5); // Start with 5% progress
    
    try {
      toast.info('Starting anomaly detection process with AI insights...');
      
      const response = await fetch(`${API_BASE_URL}/test`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      // Set to 100% when we get the response
      setProgress(100);
      
      // Check if the response is a CSV file
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/csv')) {
        // Get the file content as text
        const csvData = await response.text();
        
        // Create blob and download link
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        setResultFile(url);
        
        // Parse CSV data for the UI table
        const hasData = parseCsvForTable(csvData, onAnomalyDataReceived, onAnomalyInsightsReceived);
        setHasAnomalies(hasData);
        
        toast.success('Anomaly detection completed with AI insights! CSV file is ready for download.');
      } else {
        // If not a CSV, just show the result
        const result = await response.json();
        toast.success('Anomaly detection with AI insights completed!');
        console.log('Anomaly detection result:', result);
        
        // Parse mock CSV data for demo purposes
        const hasData = parseCsvForTable(mockCsvData, onAnomalyDataReceived, onAnomalyInsightsReceived);
        setHasAnomalies(hasData);
      }
    } catch (error) {
      console.error('Anomaly detection error:', error);
      toast.error(`Anomaly detection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // For demo purposes - simulate successful detection even on error
      const hasData = parseCsvForTable(mockCsvData, onAnomalyDataReceived, onAnomalyInsightsReceived);
      setHasAnomalies(hasData);
    } finally {
      setIsDetecting(false);
    }
  };

  const downloadFile = () => {
    if (resultFile) {
      const link = document.createElement('a');
      link.href = resultFile;
      link.download = `anomaly-results-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return {
    isDetecting,
    isGeneratingInsights,
    resultFile,
    detectAnomalies,
    generateInsights,
    downloadFile,
    progress,
    hasAnomalies,
    insightsData
  };
};
