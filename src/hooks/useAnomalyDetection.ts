
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { DynamicColumnData } from '@/lib/csv-parser';

// API base URL configuration
const API_BASE_URL = 'http://127.0.0.1:8000';

interface UseAnomalyDetectionProps {
  onAnomalyDataReceived?: (data: DynamicColumnData[], headers: string[]) => void;
}

export const useAnomalyDetection = ({ onAnomalyDataReceived }: UseAnomalyDetectionProps) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [resultFile, setResultFile] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

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

  const parseCsvForTable = (csvData: string) => {
    if (!onAnomalyDataReceived) return;
    
    const lines = csvData.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) return;
    
    const headers = lines[0].split(',').map(header => header.trim());
    const parsedData: DynamicColumnData[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      // Handle quoted fields with commas inside them
      const values: string[] = [];
      let currentValue = '';
      let inQuotes = false;
      
      for (let j = 0; j < lines[i].length; j++) {
        const char = lines[i][j];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(currentValue);
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      values.push(currentValue); // Add the last value
      
      // Create object with proper column mapping and unique ID
      const row: any = {
        id: `anomaly-${i}`,
        source: 'Anomaly Detection',
        status: 'Unmatched',
        dataType: 'anomaly'
      };
      
      // Map all fields based on header names
      headers.forEach((header, index) => {
        if (index < values.length) {
          const value = values[index]?.trim() || '';
          
          // Try to convert numeric values
          if (/^-?\d+(\.\d+)?$/.test(value)) {
            row[header] = parseFloat(value);
          } else {
            row[header] = value;
          }
        }
      });
      
      parsedData.push(row as DynamicColumnData);
    }
    
    onAnomalyDataReceived(parsedData, headers);
  };

  const detectAnomalies = async () => {
    setIsDetecting(true);
    setProgress(5); // Start with 5% progress
    
    try {
      toast.info('Starting anomaly detection process...');
      
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
        parseCsvForTable(csvData);
        
        toast.success('Anomaly detection completed! CSV file is ready for download.');
      } else {
        // If not a CSV, just show the result
        const result = await response.json();
        toast.success('Anomaly detection completed!');
        console.log('Anomaly detection result:', result);
      }
    } catch (error) {
      console.error('Anomaly detection error:', error);
      toast.error(`Anomaly detection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    resultFile,
    detectAnomalies,
    downloadFile,
    progress
  };
};
