
import { AnomalySampleRecord } from '@/types/anomaly';

// API base URL configuration
export const API_BASE_URL = 'http://127.0.0.1:8000';

// Helper function to determine severity based on bucket ID
export const getSeverityByBucketId = (bucketId: number): string => {
  if ([1, 2].includes(bucketId)) return 'high';
  if ([11, 4].includes(bucketId)) return 'medium';
  return 'low';
};

// Helper function to determine category based on bucket ID
export const getCategoryByBucketId = (bucketId: number): string => {
  if (bucketId === 1) return 'balance';
  if (bucketId === 2) return 'missing';
  if (bucketId === 8) return 'timing';
  if (bucketId === 11 || bucketId === 4) return 'unclassified';
  return 'duplicate';
};

// Generate sample records from companies
export const generateSampleRecordsFromCompanies = (companies: string[]): AnomalySampleRecord[] => {
  if (!companies || companies.length === 0) return [];
  
  return companies.map((company, index) => {
    // Generate some mock data based on the company name
    return {
      company,
      account: `${300 + index}`,
      primaryAccount: index % 2 === 0 ? 'COMMERCIAL LOANS' : 'RETAIL LOANS',
      secondaryAccount: index % 3 === 0 ? 'INTEREST RECEIVABLE' : 'PRINCIPAL',
      glBalance: Math.floor(Math.random() * 100000) + 10000,
      iHubBalance: Math.floor(Math.random() * 100000) + 10000,
      anomalyScore: -(Math.random() * 0.1).toFixed(4),
      balanceDifference: Math.floor(Math.random() * 20000) - 10000
    };
  });
};

// Parse CSV data for table display
export const parseCsvForTable = (
  csvData: string,
  onAnomalyDataReceived?: (data: any[], headers: string[]) => void,
  onAnomalyInsightsReceived?: (anomalies: any[]) => void
) => {
  if (!onAnomalyDataReceived) return false;
  
  const lines = csvData.split('\n').filter(line => line.trim() !== '');
  if (lines.length === 0) return false;
  
  const headers = lines[0].split(',').map(header => header.trim());
  const parsedData: any[] = [];
  
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
    
    parsedData.push(row);
  }
  
  onAnomalyDataReceived(parsedData, headers);
  
  return parsedData.length > 0;
};
