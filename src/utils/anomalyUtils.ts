
import { AnomalySampleRecord } from '@/types/anomaly';

// API base URL configuration
export const API_BASE_URL = 'http://127.0.0.1:8000';

// Helper function to determine severity based on bucket ID
export const getSeverityByBucketId = (bucketId: number): string => {
  if ([1, 2].includes(bucketId)) return 'high';
  if ([11, 4, 5].includes(bucketId)) return 'medium';
  return 'low';
};

// Helper function to determine category based on bucket ID
export const getCategoryByBucketId = (bucketId: number): string => {
  if (bucketId === 1) return 'balance';
  if (bucketId === 2) return 'missing';
  if (bucketId === 8) return 'timing';
  if (bucketId === 7) return 'duplicate';
  if (bucketId === 5) return 'trend';
  if (bucketId === 11 || bucketId === 4) return 'unclassified';
  return 'unclassified';
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

// Improved CSV parser with better header handling
export const parseCsvForTable = (
  csvData: string,
  onAnomalyDataReceived?: (data: any[], headers: string[]) => void,
  onAnomalyInsightsReceived?: (anomalies: any[]) => void
) => {
  if (!onAnomalyDataReceived) return false;
  
  const lines = csvData.split('\n').filter(line => line.trim() !== '');
  if (lines.length === 0) return false;
  
  // Extract and clean headers 
  const rawHeaders = lines[0].split(',').map(header => header.trim());
  
  // Filter out empty headers
  const headers = rawHeaders.filter(header => header && header.trim() !== '');
  
  console.log(`CSV parsing: Found ${headers.length} non-empty headers out of ${rawHeaders.length} total`);
  
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
    
    // Map only valid fields based on clean header names
    headers.forEach((header, index) => {
      if (index < values.length && header) {
        const value = values[index]?.trim() || '';
        
        // Try to convert numeric values
        if (/^-?\d+(\.\d+)?$/.test(value)) {
          row[header] = parseFloat(value);
        } else {
          row[header] = value;
        }
      }
    });
    
    // Only include rows that have some data besides the default properties
    const hasCustomData = Object.keys(row).some(key => 
      !['id', 'source', 'status', 'dataType'].includes(key) && 
      row[key] !== undefined && 
      row[key] !== null && 
      row[key] !== ''
    );
    
    if (hasCustomData) {
      parsedData.push(row);
    }
  }
  
  console.log(`CSV parsing: Processed ${parsedData.length} data rows with ${headers.length} columns`);
  
  if (parsedData.length > 0) {
    onAnomalyDataReceived(parsedData, headers);
    return true;
  }
  
  return false;
};
