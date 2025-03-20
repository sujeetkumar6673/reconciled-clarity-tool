
import { ReconciliationData } from '@/components/FileUpload';

export function parseCSV(csvText: string, fileName: string): ReconciliationData[] {
  // Split the CSV text into lines
  const lines = csvText.split('\n').filter(line => line.trim() !== '');
  
  if (lines.length <= 1) {
    throw new Error('CSV file is empty or contains only headers');
  }
  
  // Parse header row to get field names
  const headers = lines[0].split(',').map(header => header.trim());
  const result: ReconciliationData[] = [];
  
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
    
    // Map CSV fields to ReconciliationData structure
    // This is a basic mapping that assumes specific columns exist
    const rowData: Partial<ReconciliationData> = {
      id: `${fileName}-${i}`, // Generate a unique ID
      source: fileName,
      status: determineStatus(), // Random status for demo
    };
    
    // Map fields based on common header names
    headers.forEach((header, index) => {
      const value = values[index]?.trim() || '';
      const lowerHeader = header.toLowerCase();
      
      if (lowerHeader.includes('date')) {
        rowData.date = value;
      } else if (lowerHeader.includes('descr')) {
        rowData.description = value;
      } else if (lowerHeader.includes('categ') || lowerHeader.includes('type')) {
        rowData.category = value;
      } else if (lowerHeader.includes('amount')) {
        rowData.amount = parseFloat(value.replace(/[^0-9.-]+/g, '')) || 0;
      }
    });
    
    // Ensure all required fields are present
    if (rowData.date && (rowData.description || rowData.category)) {
      result.push({
        id: rowData.id || `unknown-${i}`,
        date: rowData.date || new Date().toISOString().slice(0, 10),
        description: rowData.description || 'No description',
        category: rowData.category || 'Uncategorized',
        amount: rowData.amount || 0,
        status: rowData.status || 'Pending',
        source: rowData.source || fileName
      });
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
