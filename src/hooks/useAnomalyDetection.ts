
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { DynamicColumnData } from '@/lib/csv-parser';
import { AnomalyItem, UseAnomalyDetectionProps } from '@/types/anomaly';
import { API_BASE_URL, parseCsvForTable } from '@/utils/anomalyUtils';
import { useAnomalyInsights } from './useAnomalyInsights';

export const useAnomalyDetection = ({ 
  onAnomalyDataReceived, 
  onAnomalyInsightsReceived 
}: UseAnomalyDetectionProps = {}) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [resultFile, setResultFile] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [hasAnomalies, setHasAnomalies] = useState(false);
  const [totalAnomaliesCount, setTotalAnomaliesCount] = useState(0);
  const [totalImpactValue, setTotalImpactValue] = useState(0);
  
  const { 
    isGeneratingInsights, 
    generateInsights, 
    insightsData 
  } = useAnomalyInsights({ 
    onAnomalyInsightsReceived,
  });

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

  // Debug logging for state changes
  useEffect(() => {
    console.log("useAnomalyDetection - State updated:", { totalAnomaliesCount, totalImpactValue });
  }, [totalAnomaliesCount, totalImpactValue]);

  const detectAnomalies = useCallback(async () => {
    setIsDetecting(true);
    setProgress(5); // Start with 5% progress
    
    try {
      toast.info('Starting anomaly detection process with AI insights...');
      
      // Increased timeout for anomaly detection - 300 seconds (5 minutes)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000);
      
      try {
        const response = await fetch(`${API_BASE_URL}/test`, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Accept': 'application/json, text/csv, */*',
            'Cache-Control': 'no-cache'
          }
        });
        
        clearTimeout(timeoutId);
        
        // Set to 100% when we get the response
        setProgress(100);
        
        // Handle non-200 responses properly
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`API Error (${response.status}): ${errorText}`);
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
        
        // Check content type to determine how to handle the response
        const contentType = response.headers.get('content-type');
        console.log(`Response content type: ${contentType}`);
        
        if (contentType && contentType.includes('text/csv')) {
          // Handle CSV response
          const csvData = await response.text();
          
          // Create blob and download link
          const blob = new Blob([csvData], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          setResultFile(url);
          
          // Parse CSV data for the UI table
          const hasData = parseCsvForTable(csvData, 
            (data, headers) => {
              if (onAnomalyDataReceived) {
                console.log('Processing anomaly data with headers:', headers);
                
                // Filter out any rows with all empty values
                const filteredData = data.filter(row => 
                  Object.values(row).some(value => 
                    value !== null && value !== undefined && value !== ''
                  )
                );
                
                // CRITICAL FIX: First update the state
                const anomaliesCount = filteredData.length;
                console.log(`Setting totalAnomaliesCount to ${anomaliesCount}`);
                setTotalAnomaliesCount(anomaliesCount);
                
                // Then call the callback
                onAnomalyDataReceived(filteredData, headers);
              }
            }, 
            onAnomalyInsightsReceived
          );
          
          setHasAnomalies(hasData);
          
          toast.success('Anomaly detection completed with AI insights! CSV file is ready for download.');
        } else {
          // Handle JSON response
          let result;
          try {
            result = await response.json();
            console.log('Anomaly detection API response:', result);
            
            // Extract data from the API response
            if (result) {
              // CRITICAL FIX: First update state with values from the API immediately
              if (typeof result.anomaly_count === 'number') {
                console.log(`Received anomaly_count: ${result.anomaly_count}`);
                // Explicitly update state with the correct value
                setTotalAnomaliesCount(result.anomaly_count);
              }
              
              if (typeof result.total_impact === 'number') {
                console.log(`Received total_impact: ${result.total_impact}`);
                // Explicitly update state with the correct value
                setTotalImpactValue(result.total_impact);
              }
              
              if (result.data && Array.isArray(result.data)) {
                // Process JSON data directly
                if (onAnomalyDataReceived) {
                  // Transform the data to match the expected format
                  const jsonData = result.data.map((item: any, index: number) => ({
                    id: `anomaly-${index}`,
                    source: 'Anomaly Detection',
                    status: 'Unmatched',
                    dataType: 'anomaly',
                    ...item
                  }));
                  
                  // Extract headers from the first item if available
                  const headers = result.data.length > 0 
                    ? Object.keys(result.data[0]).filter(key => key !== '__proto__')
                    : [];
                  
                  // CRITICAL FIX: Call the callback after updating state
                  onAnomalyDataReceived(jsonData, headers);
                }
                
                setHasAnomalies(result.data.length > 0);
                
                // Use either the anomaly_count from the response or the length of the data array
                const anomalyCount = typeof result.anomaly_count === 'number' 
                  ? result.anomaly_count 
                  : result.data.length;
                
                toast.success(`Anomaly detection completed! Found ${anomalyCount} anomalies.`);
              } else {
                throw new Error('Invalid data structure in API response');
              }
            }
          } catch (jsonError) {
            console.error('Error parsing or processing JSON response:', jsonError);
            const textContent = await response.text();
            console.log('Raw response content:', textContent.substring(0, 200) + '...');
            throw new Error('Invalid response format from server');
          }
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
    } catch (error) {
      console.error('Anomaly detection error:', error);
      
      if (error.name === 'AbortError') {
        toast.error('Anomaly detection request timed out.');
      } else {
        toast.error(`Anomaly detection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      // No mock data fallback - just show error
      setHasAnomalies(false);
    } finally {
      setIsDetecting(false);
    }
  }, [onAnomalyDataReceived, onAnomalyInsightsReceived]);

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
    insightsData,
    totalAnomaliesCount,
    totalImpactValue
  };
};
