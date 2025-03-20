
import React, { useState, useMemo } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpDown, MoreHorizontal, FileSearch, Download } from 'lucide-react';
import { DynamicColumnData } from '@/lib/csv-parser';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface DynamicTableProps {
  data: DynamicColumnData[];
  headers: string[];
}

const DynamicTable: React.FC<DynamicTableProps> = ({ data, headers }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const itemsPerPage = 10;

  // Get all columns, prioritizing important ones and ensuring status/source are at the end
  const columns = useMemo(() => {
    // Make a prioritized list of columns
    const priorityColumns = ['id', 'date', 'description', 'category', 'amount'];
    const endColumns = ['status', 'source'];
    
    // Get all unique keys from data objects
    const allKeys = new Set<string>();
    data.forEach(item => {
      Object.keys(item).forEach(key => allKeys.add(key));
    });
    
    // Start with priority columns (that exist in the data)
    const result: string[] = priorityColumns.filter(col => allKeys.has(col));
    
    // Add headers that aren't already in the result or in endColumns
    headers.forEach(header => {
      if (!result.includes(header) && !endColumns.includes(header)) {
        result.push(header);
      }
    });
    
    // Add any remaining keys from the data that aren't already included
    Array.from(allKeys).forEach(key => {
      if (!result.includes(key) && !endColumns.includes(key)) {
        result.push(key);
      }
    });
    
    // End with status and source (if they exist in the data)
    endColumns.forEach(col => {
      if (allKeys.has(col)) {
        result.push(col);
      }
    });
    
    return result;
  }, [data, headers]);

  // Sorting function
  const handleSort = (columnId: string) => {
    if (sortBy === columnId) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(columnId);
      setSortDirection('asc');
    }
  };

  // Apply filtering
  const filteredData = data.filter(item => {
    // Apply status filter
    if (statusFilter !== 'all' && item.status !== statusFilter) {
      return false;
    }
    
    // Apply search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      // Search through all properties
      return Object.values(item).some(value => 
        String(value).toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  // Apply sorting and pagination
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortBy) return 0;
    
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    } else if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' 
        ? aValue - bValue 
        : bValue - aValue;
    }
    
    // Convert to strings for comparison if types don't match
    return sortDirection === 'asc'
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });

  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const getStatusColor = (status: string) => {
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

  // Format cell value based on content type
  const formatCellValue = (value: any, columnName: string) => {
    if (value === undefined || value === null) {
      return '';
    }
    
    if (columnName === 'status' && typeof value === 'string') {
      return (
        <span className={cn(
          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
          getStatusColor(value)
        )}>
          {value}
        </span>
      );
    }
    
    if (columnName === 'source' && typeof value === 'string') {
      return <span className="text-xs text-gray-500">{value.split('/').pop()}</span>;
    }
    
    if (typeof value === 'number') {
      return columnName.toLowerCase().includes('amount') 
        ? `$${Math.abs(value).toFixed(2)}`
        : value.toString();
    }
    
    return value.toString();
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <div className="mb-8">
        <h2 className="text-2xl font-medium text-center mb-2">Reconciliation Data</h2>
        <p className="text-muted-foreground text-center max-w-2xl mx-auto">
          {data.length} records found from uploaded files
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="w-full md:w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Reconciled">Reconciled</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Unmatched">Unmatched</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setSearchTerm('');
            setStatusFilter('all');
          }}
        >
          Reset Filters
        </Button>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map(column => (
                <TableHead key={column} className={column === 'amount' ? 'text-right' : ''}>
                  <div className={`flex items-center ${column === 'amount' ? 'justify-end' : ''} cursor-pointer`} 
                       onClick={() => handleSort(column)}>
                    {column.charAt(0).toUpperCase() + column.slice(1)}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
              ))}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((item) => (
              <TableRow key={item.id}>
                {columns.map(column => (
                  <TableCell 
                    key={`${item.id}-${column}`} 
                    className={column === 'amount' ? 'text-right' : (column === 'source' ? 'text-center' : '')}
                  >
                    {formatCellValue(item[column], column)}
                  </TableCell>
                ))}
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="flex items-center cursor-pointer">
                        <FileSearch className="mr-2 h-4 w-4" />
                        <span>View Details</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center cursor-pointer">
                        <Download className="mr-2 h-4 w-4" />
                        <span>Export</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {paginatedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="text-center py-8 text-muted-foreground">
                  No matching records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {filteredData.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-400">
              Showing <span className="font-medium">{Math.min((currentPage - 1) * itemsPerPage + 1, filteredData.length)}</span> to{' '}
              <span className="font-medium">
                {Math.min(currentPage * itemsPerPage, filteredData.length)}
              </span>{' '}
              of <span className="font-medium">{filteredData.length}</span> results
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, index) => {
              let pageNumber: number;
              // Logic to show pages around the current page
              if (totalPages <= 5) {
                pageNumber = index + 1;
              } else if (currentPage <= 3) {
                pageNumber = index + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + index;
              } else {
                pageNumber = currentPage - 2 + index;
              }
              
              return (
                <Button
                  key={index}
                  variant={currentPage === pageNumber ? "default" : "outline"}
                  onClick={() => setCurrentPage(pageNumber)}
                  className="hidden md:inline-block"
                >
                  {pageNumber}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicTable;
