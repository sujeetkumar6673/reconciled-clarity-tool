
import React from 'react';
import { cn } from '@/lib/utils';

interface TableCellFormatterProps {
  value: any;
  columnName: string;
}

export const TableCellFormatter: React.FC<TableCellFormatterProps> = ({ value, columnName }) => {
  if (value === undefined || value === null) {
    return null;
  }
  
  // Enhanced normalization for column names to be more thorough with case and whitespace
  const normalizedColumnName = columnName.toLowerCase().replace(/[\s_-]+/g, '');
  
  // Handle status fields (any column ending with 'status' or exactly 'status')
  if ((normalizedColumnName === 'status' || normalizedColumnName.endsWith('status')) && typeof value === 'string') {
    return (
      <span className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        getStatusColor(value)
      )}>
        {value}
      </span>
    );
  }
  
  // Handle data type fields
  if ((normalizedColumnName === 'datatype' || normalizedColumnName === 'data_type' || normalizedColumnName === 'datatype') && typeof value === 'string') {
    return (
      <span className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        getDataTypeColor(value)
      )}>
        {getDataTypeDisplayValue(value)}
      </span>
    );
  }
  
  // Handle source fields
  if (normalizedColumnName === 'source' && typeof value === 'string') {
    return <span className="text-xs text-gray-500">{value.split('/').pop()}</span>;
  }
  
  if (typeof value === 'number') {
    // Format numeric values - enhanced to catch more monetary column patterns
    const isAmount = normalizedColumnName.includes('amount') || 
                     normalizedColumnName.includes('balance') ||
                     normalizedColumnName.includes('difference') ||
                     normalizedColumnName.includes('value') || 
                     normalizedColumnName.includes('price') ||
                     normalizedColumnName.includes('cost');
    
    if (isAmount) {
      // For positive/negative numbers, don't use absolute value
      return value < 0 
        ? `-$${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}` 
        : `$${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    }
    
    return value.toLocaleString();
  }
  
  return value.toString();
};

// Helper functions
export const getStatusColor = (status: string) => {
  const normalizedStatus = status.toLowerCase();
  
  if (normalizedStatus.includes('reconciled') || normalizedStatus.includes('resolved') || normalizedStatus.includes('complete')) {
    return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
  }
  
  if (normalizedStatus.includes('pending') || normalizedStatus.includes('in progress') || normalizedStatus.includes('processing')) {
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
  }
  
  if (normalizedStatus.includes('unmatched') || normalizedStatus.includes('error') || normalizedStatus.includes('failed')) {
    return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
  }
  
  return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
};

export const getDataTypeColor = (dataType: string) => {
  const normalizedType = dataType.toLowerCase();
  
  if (normalizedType.includes('current')) {
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
  }
  
  if (normalizedType.includes('historical') || normalizedType.includes('history')) {
    return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
  }
  
  if (normalizedType.includes('anomaly') || normalizedType.includes('error')) {
    return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
  }
  
  return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
};

export const getDataTypeDisplayValue = (dataType: string) => {
  const normalizedType = dataType.toLowerCase();
  
  if (normalizedType.includes('current')) {
    return 'Current';
  }
  
  if (normalizedType.includes('historical') || normalizedType.includes('history')) {
    return 'Historical';
  }
  
  if (normalizedType.includes('anomaly')) {
    return 'Anomaly';
  }
  
  // If it doesn't match any of our known types, capitalize first letter
  return dataType.charAt(0).toUpperCase() + dataType.slice(1);
};
