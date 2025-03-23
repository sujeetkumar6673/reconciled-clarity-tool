
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { DynamicColumnData } from '@/lib/csv-parser';
import { AnomalyItem, AnomalySampleRecord } from '@/components/anomaly/AnomalyCard';

// API base URL configuration
const API_BASE_URL = 'http://127.0.0.1:8000';

interface UseAnomalyDetectionProps {
  onAnomalyDataReceived?: (data: DynamicColumnData[], headers: string[]) => void;
  onAnomalyInsightsReceived?: (anomalies: AnomalyItem[]) => void;
}

interface InsightResponse {
  bucket_id: number;
  bucket_description: string;
  anomaly_count: number;
  sample_companies: string[];
  root_cause: string;
  recommendation: string;
}

export const useAnomalyDetection = ({ 
  onAnomalyDataReceived, 
  onAnomalyInsightsReceived 
}: UseAnomalyDetectionProps = {}) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [resultFile, setResultFile] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [hasAnomalies, setHasAnomalies] = useState(false);
  const [insightsData, setInsightsData] = useState<InsightResponse[]>([]);

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
    
    // Process the data into AI insights if callback provided
    if (onAnomalyInsightsReceived) {
      processAnomalyInsights(parsedData, headers);
    }
    
    // Set hasAnomalies to true if we have anomaly data
    if (parsedData.length > 0) {
      setHasAnomalies(true);
    }
  };
  
  // Function to transform CSV data into structured anomaly insights
  const processAnomalyInsights = (data: DynamicColumnData[], headers: string[]) => {
    if (!onAnomalyInsightsReceived || data.length === 0) return;
    
    // This is a mock implementation - in a real app, this would parse the actual
    // data and create proper anomaly items based on the detection results
    const buckets: {[key: string]: any} = {
      'Bucket 1': {
        title: 'Inconsistent Variations in Outstanding Balances',
        description: 'Several accounts showing inconsistent variations that exceed the normal threshold',
        category: 'balance',
        severity: 'high',
        rootCauses: [
          'Data entry errors leading to temporary inconsistencies',
          'Timing differences in recording transactions',
          'Misalignment in reconciliation processes or methodologies'
        ],
        suggestedActions: [
          'Conduct a detailed review of data entry processes to ensure accuracy',
          'Align transaction recording timing between systems',
          'Standardize reconciliation methodologies across departments'
        ],
        count: 0,
        samples: []
      },
      'Bucket 11': {
        title: 'No Clear Pattern, Deviation Exceeds Threshold',
        description: 'Account balances showing deviations that exceed thresholds without clear patterns',
        category: 'unclassified',
        severity: 'medium',
        rootCauses: [
          'Unusual transactions that do not follow historical patterns',
          'Errors in threshold settings or detection algorithms'
        ],
        suggestedActions: [
          'Investigate each case individually to identify unique causes',
          'Review and adjust threshold settings and anomaly detection algorithms'
        ],
        count: 0,
        samples: []
      },
      // Additional buckets based on user's data
      'Bucket 2': {
        title: 'Consistent Increase/Decrease in Balances',
        description: 'Systematic trend of increases or decreases in account balances',
        category: 'missing',
        severity: 'high',
        rootCauses: [
          'Systematic errors in transaction processing',
          'Consistent misreporting or misclassification of transactions'
        ],
        suggestedActions: [
          'Audit transaction processing systems for systematic errors',
          'Implement checks for consistent misreporting or misclassification'
        ],
        count: 0,
        samples: []
      },
      'Bucket 8': {
        title: 'Reversal or Correction Entry Detected',
        description: 'Evidence of reversal or correction entries that require validation',
        category: 'timing',
        severity: 'low',
        rootCauses: [
          'Reversal entries made to correct prior errors',
          'Adjustments not properly documented or communicated'
        ],
        suggestedActions: [
          'Ensure all reversal and correction entries are properly documented',
          'Enhance communication protocols for adjustments'
        ],
        count: 0,
        samples: []
      },
      'Bucket 4': {
        title: 'Balances Not in Line with Previous Months',
        description: 'Account balances showing unexpected deviations from historical patterns',
        category: 'unclassified',
        severity: 'medium',
        rootCauses: [
          'Seasonal fluctuations not accounted for in analysis',
          'Changes in business operations or external factors'
        ],
        suggestedActions: [
          'Incorporate seasonal adjustments into analysis',
          'Investigate changes in business operations or external factors impacting balances'
        ],
        count: 0,
        samples: []
      }
    };
    
    // Mock method to assign data points to buckets
    // In real implementation, this would use the actual data attributes
    data.forEach((item, index) => {
      const bucket = Object.keys(buckets)[index % Object.keys(buckets).length];
      buckets[bucket].count++;
      
      if (buckets[bucket].samples.length < 2) {
        const company = item.Company || item.company || `Company-${index + 100}`;
        const account = item.Account || item.account || `${index + 200}`;
        const primaryAccount = item.PrimaryAccount || item.primaryAccount || 'LOANS';
        const secondaryAccount = item.SecondaryAccount || item.secondaryAccount || 'PRINCIPAL';
        const glBalance = item.GLBalance || item.glBalance || Math.floor(Math.random() * 100000);
        const iHubBalance = item.iHubBalance || Math.floor(Math.random() * 100000);
        const difference = (typeof glBalance === 'number' && typeof iHubBalance === 'number') 
          ? glBalance - iHubBalance 
          : 0;
        
        buckets[bucket].samples.push({
          company,
          account,
          primaryAccount,
          secondaryAccount,
          glBalance,
          iHubBalance,
          anomalyScore: -(Math.random() * 0.1).toFixed(4),
          balanceDifference: difference
        });
      }
    });
    
    // Convert buckets to AnomalyItems
    const anomalyItems: AnomalyItem[] = Object.entries(buckets).map(([bucketName, data], index) => {
      return {
        id: index + 1,
        title: data.title,
        description: data.description,
        severity: data.severity,
        category: data.category,
        date: new Date().toISOString().split('T')[0],
        impact: `$${(Math.random() * 10000 + 500).toFixed(2)}`,
        status: Math.random() > 0.8 ? 'resolved' : 'unresolved',
        bucket: `${bucketName}: ${data.title}`,
        anomalyCount: data.count,
        rootCauses: data.rootCauses,
        suggestedActions: data.suggestedActions,
        sampleRecords: data.samples as AnomalySampleRecord[]
      };
    });
    
    onAnomalyInsightsReceived(anomalyItems);
  };

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
        parseCsvForTable(csvData);
        
        toast.success('Anomaly detection completed with AI insights! CSV file is ready for download.');
      } else {
        // If not a CSV, just show the result
        const result = await response.json();
        toast.success('Anomaly detection with AI insights completed!');
        console.log('Anomaly detection result:', result);
        
        // Mock CSV data for demo purposes
        // In a real app, this would come from the API response
        const mockCsvData = `Company,Account,PrimaryAccount,SecondaryAccount,GLBalance,iHubBalance,AnomalyScore,BalanceDifference
Doyle Ltd,740,COMMERCIAL LOANS,INTEREST RECEIVABLE,83000,83000,-0.0121,0
Galloway-Wyatt,493,ALL LOB LOANS,PRINCIPAL,22000,22000,-0.0216,0
Abbott-Munoz,327,RETAIL LOANS,DEFERRED COSTS,88000,105000,-0.0275,-17000
Mcclain Miller Henderson,298,RETAIL LOANS,INTEREST RECEIVABLE,32000,23000,-0.0190,9000
Guzman Hoffman Baldwin,365,COMMERCIAL LOANS,DEFERRED COSTS,82000,93000,-0.0730,-11000`;
        
        parseCsvForTable(mockCsvData);
      }
    } catch (error) {
      console.error('Anomaly detection error:', error);
      toast.error(`Anomaly detection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // For demo purposes - simulate successful detection even on error
      // Remove in production
      const mockCsvData = `Company,Account,PrimaryAccount,SecondaryAccount,GLBalance,iHubBalance,AnomalyScore,BalanceDifference
Doyle Ltd,740,COMMERCIAL LOANS,INTEREST RECEIVABLE,83000,83000,-0.0121,0
Galloway-Wyatt,493,ALL LOB LOANS,PRINCIPAL,22000,22000,-0.0216,0
Abbott-Munoz,327,RETAIL LOANS,DEFERRED COSTS,88000,105000,-0.0275,-17000
Mcclain Miller Henderson,298,RETAIL LOANS,INTEREST RECEIVABLE,32000,23000,-0.0190,9000
Guzman Hoffman Baldwin,365,COMMERCIAL LOANS,DEFERRED COSTS,82000,93000,-0.0730,-11000`;
      
      parseCsvForTable(mockCsvData);
      
    } finally {
      setIsDetecting(false);
    }
  };

  const generateInsights = async () => {
    setIsGeneratingInsights(true);
    
    try {
      toast.info('Generating detailed AI insights...');
      
      // Simulate API call delay for better UX
      const mockApiCall = new Promise<InsightResponse[]>(resolve => {
        setTimeout(() => {
          // This is mock data for demonstration
          // In a real app, this would come from the API
          resolve([
            {
              bucket_id: 1,
              bucket_description: "Inconsistent variations in outstanding balances",
              anomaly_count: 17,
              sample_companies: ["Doyle Ltd", "Galloway-Wyatt"],
              root_cause: "Timing differences in transaction entries.",
              recommendation: "Implement stricter transaction time controls."
            },
            {
              bucket_id: 11,
              bucket_description: "No clear pattern, but deviation exceeds threshold",
              anomaly_count: 7,
              sample_companies: ["Abbott-Munoz"],
              root_cause: "Unusual transactions that do not follow historical patterns.",
              recommendation: "Investigate each case individually to identify unique causes."
            },
            {
              bucket_id: 2,
              bucket_description: "Consistent increase or decrease in outstanding balances",
              anomaly_count: 6,
              sample_companies: ["Mcclain Miller Henderson"],
              root_cause: "Systematic errors in transaction processing.",
              recommendation: "Audit transaction processing systems for systematic errors."
            },
            {
              bucket_id: 8,
              bucket_description: "Reversal or correction entry detected",
              anomaly_count: 3,
              sample_companies: ["Guzman Hoffman Baldwin"],
              root_cause: "Reversal entries made to correct prior errors.",
              recommendation: "Ensure all reversal and correction entries are properly documented."
            },
            {
              bucket_id: 4,
              bucket_description: "Outstanding balances not in line with previous months",
              anomaly_count: 3,
              sample_companies: [],
              root_cause: "Seasonal fluctuations not accounted for in analysis.",
              recommendation: "Incorporate seasonal adjustments into analysis."
            }
          ]);
        }, 2000);
      });

      // In a real app, you would call the actual API
      // const response = await fetch(`${API_BASE_URL}/get/insight`, {
      //   method: 'GET',
      // });
      // if (!response.ok) {
      //   throw new Error(`Error ${response.status}: ${response.statusText}`);
      // }
      // const insightsData = await response.json();

      const insightsData = await mockApiCall;
      setInsightsData(insightsData);
      
      // If onAnomalyInsightsReceived is provided, convert the insights data to AnomalyItem format
      if (onAnomalyInsightsReceived) {
        const anomalyItems: AnomalyItem[] = insightsData.map((insight, index) => {
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
            sampleRecords: []
          };
        });
        
        onAnomalyInsightsReceived(anomalyItems);
      }
      
      toast.success('AI insights generated successfully!');
    } catch (error) {
      console.error('Insights generation error:', error);
      toast.error(`Failed to generate insights: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGeneratingInsights(false);
    }
  };
  
  // Helper function to determine severity based on bucket ID
  const getSeverityByBucketId = (bucketId: number): string => {
    if ([1, 2].includes(bucketId)) return 'high';
    if ([11, 4].includes(bucketId)) return 'medium';
    return 'low';
  };
  
  // Helper function to determine category based on bucket ID
  const getCategoryByBucketId = (bucketId: number): string => {
    if (bucketId === 1) return 'balance';
    if (bucketId === 2) return 'missing';
    if (bucketId === 8) return 'timing';
    if (bucketId === 11 || bucketId === 4) return 'unclassified';
    return 'duplicate';
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
