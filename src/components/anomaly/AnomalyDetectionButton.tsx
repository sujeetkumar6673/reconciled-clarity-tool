
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Download } from 'lucide-react';
import { toast } from 'sonner';
import { DynamicColumnData } from '@/lib/csv-parser';

// API base URL configuration
const API_BASE_URL = 'http://127.0.0.1:8000';

interface AnomalyDetectionButtonProps {
  onAnomalyDataReceived?: (data: DynamicColumnData[], headers: string[]) => void;
}

const AnomalyDetectionButton: React.FC<AnomalyDetectionButtonProps> = ({ onAnomalyDataReceived }) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [resultFile, setResultFile] = useState<string | null>(null);

  const detectAnomalies = async () => {
    setIsDetecting(true);
    try {
      toast.info('Starting anomaly detection process...');
      
      const response = await fetch(`${API_BASE_URL}/test`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
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
        if (onAnomalyDataReceived) {
          const lines = csvData.split('\n').filter(line => line.trim() !== '');
          if (lines.length > 0) {
            const headers = lines[0].split(',').map(header => header.trim());
            const parsedData: DynamicColumnData[] = [];
            
            for (let i = 1; i < lines.length; i++) {
              if (!lines[i].trim()) continue;
              
              const values = lines[i].split(',').map(val => val.trim());
              const row: any = {
                id: `anomaly-${i}`,
                source: 'Anomaly Detection',
                status: 'Unmatched',
                dataType: 'anomaly'
              };
              
              headers.forEach((header, index) => {
                const value = values[index] || '';
                if (/^-?\d+(\.\d+)?$/.test(value)) {
                  row[header] = parseFloat(value);
                } else {
                  row[header] = value;
                }
              });
              
              parsedData.push(row as DynamicColumnData);
            }
            
            onAnomalyDataReceived(parsedData, headers);
          }
        }
        
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

  return (
    <div className="flex flex-col items-center gap-4">
      <Button
        onClick={detectAnomalies}
        disabled={isDetecting}
        size="lg"
        className="bg-amber-600 hover:bg-amber-700"
      >
        {isDetecting ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Detecting Anomalies...
          </>
        ) : (
          <>
            <AlertTriangle className="mr-2 h-5 w-5" />
            Detect Anomalies
          </>
        )}
      </Button>
      
      {resultFile && (
        <Button 
          onClick={downloadFile}
          variant="outline"
          className="mt-2"
        >
          <Download className="mr-2 h-4 w-4" />
          Download Results
        </Button>
      )}
    </div>
  );
};

export default AnomalyDetectionButton;
