
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
  
  // Split by new lines and filter out empty lines
  const lines = csvData.split('\n').filter(line => line.trim() !== '');
  if (lines.length === 0) return false;
  
  // Extract and clean headers - first handle quoted headers properly
  let rawHeaderLine = lines[0];
  let processedHeaders: string[] = [];
  
  // Check if headers contain quotes and commas
  if (rawHeaderLine.includes('"') && rawHeaderLine.includes(',')) {
    let inQuotes = false;
    let currentHeader = "";
    
    for (let i = 0; i < rawHeaderLine.length; i++) {
      const char = rawHeaderLine[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        processedHeaders.push(currentHeader.trim());
        currentHeader = "";
      } else {
        currentHeader += char;
      }
    }
    
    // Add the last header
    processedHeaders.push(currentHeader.trim());
  } else {
    // Simple split for non-quoted headers
    processedHeaders = rawHeaderLine.split(',').map(h => h.trim());
  }
  
  // Remove any empty or duplicate headers
  const uniqueHeaders = processedHeaders.filter((header, index, self) => {
    // Filter out empty headers or headers that appear earlier in the array
    return header && header.trim() !== '' && 
           self.findIndex(h => h.toLowerCase() === header.toLowerCase()) === index;
  });
  
  console.log(`CSV parsing: Found ${uniqueHeaders.length} unique headers out of ${processedHeaders.length} total`);
  
  const parsedData: any[] = [];
  
  // Process data rows (starting from line 1)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Handle quoted fields with commas inside them
    const values: string[] = [];
    let currentValue = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(currentValue.trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    
    // Add the last value
    values.push(currentValue.trim());
    
    // Create object with proper column mapping and unique ID
    const row: any = {
      id: `anomaly-${i}`,
      source: 'Anomaly Detection',
      status: 'Unmatched',
      dataType: 'anomaly'
    };
    
    // Map only valid fields based on unique header names
    uniqueHeaders.forEach((header, index) => {
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
    
    // Only include rows that have some actual data
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
  
  console.log(`CSV parsing: Processed ${parsedData.length} data rows with ${uniqueHeaders.length} columns`);
  
  if (parsedData.length > 0) {
    // Call the callback with properly filtered headers
    onAnomalyDataReceived(parsedData, uniqueHeaders);
    return true;
  }
  
  return false;
};
