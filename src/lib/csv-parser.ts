
import { ReconciliationData } from '@/components/FileUpload';

export interface DynamicColumnData {
  [key: string]: string | number;
  id: string;
  source: string;
  status: 'Reconciled' | 'Pending' | 'Unmatched';
  dataType: 'current' | 'historical';
}

export function parseCSV(csvText: string, fileName: string, dataType: 'current' | 'historical'): DynamicColumnData[] {
  // Split the CSV text into lines
  const lines = csvText.split('\n').filter(line => line.trim() !== '');
  
  if (lines.length <= 1) {
    throw new Error('CSV file is empty or contains only headers');
  }
  
  // Parse header row to get field names
  const headers = lines[0].split(',').map(header => header.trim());
  const result: DynamicColumnData[] = [];
  
  // Process data rows
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
        values.push(currentValue);
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue); // Add the last value
    
    // Create object with dynamic column names from headers
    const rowData: DynamicColumnData = {
      id: `${fileName}-${i}`, // Generate a unique ID
      source: fileName,
      status: determineStatus(), // Random status for demo
      dataType: dataType, // Add the data type
    };
    
    // Map all fields based on header names
    headers.forEach((header, index) => {
      const value = values[index]?.trim() || '';
      
      // Try to convert numeric values
      if (/^-?\d+(\.\d+)?$/.test(value)) {
        rowData[header] = parseFloat(value);
      } else {
        rowData[header] = value;
      }
    });
    
    // Only add if we have some valid data
    if (Object.keys(rowData).length > 4) { // More than just id, source, status, dataType
      result.push(rowData);
    }
  }
  
  return result;
}

// Helper function to generate random status for demonstration
function determineStatus(): 'Reconciled' | 'Pending' | 'Unmatched' {
  const random = Math.random();
  if (random < 0.6) return 'Reconciled';
  if (random < 0.9) return 'Pending';
  return 'Unmatched';
}
