
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
  
  // Normalize column name to check against various formats
  const normalizedColumnName = columnName.toLowerCase().replace(/\s+/g, '');
  
  if (normalizedColumnName === 'status' && typeof value === 'string') {
    return (
      <span className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        getStatusColor(value)
      )}>
        {value}
      </span>
    );
  }
  
  if (normalizedColumnName === 'datatype' && typeof value === 'string') {
    return (
      <span className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        getDataTypeColor(value)
      )}>
        {getDataTypeDisplayValue(value)}
      </span>
    );
  }
  
  if (normalizedColumnName === 'source' && typeof value === 'string') {
    return <span className="text-xs text-gray-500">{value.split('/').pop()}</span>;
  }
  
  if (typeof value === 'number') {
    // Format numeric values
    const isAmount = normalizedColumnName.includes('amount') || 
                     normalizedColumnName.includes('balance') ||
                     normalizedColumnName.includes('difference');
    
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
  switch (status) {
    case 'Reconciled':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'Unmatched':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
  }
};

export const getDataTypeColor = (dataType: string) => {
  switch (dataType) {
    case 'current':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'historical':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
    case 'anomaly':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
  }
};

export const getDataTypeDisplayValue = (dataType: string) => {
  switch (dataType) {
    case 'current':
      return 'Current';
    case 'historical':
      return 'Historical';
    case 'anomaly':
      return 'Anomaly';
    default:
      return dataType;
  }
};
