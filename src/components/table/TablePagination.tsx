
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface TablePaginationProps {
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  filteredDataLength: number;
  itemsPerPage: number;
}

const TablePagination: React.FC<TablePaginationProps> = ({
  currentPage,
  setCurrentPage,
  totalPages,
  filteredDataLength,
  itemsPerPage
}) => {
  if (filteredDataLength === 0) return null;

  return (
    <div className="flex items-center justify-between mt-4">
      <div>
        <p className="text-sm text-gray-700 dark:text-gray-400">
          Showing <span className="font-medium">{Math.min((currentPage - 1) * itemsPerPage + 1, filteredDataLength)}</span> to{' '}
          <span className="font-medium">
            {Math.min(currentPage * itemsPerPage, filteredDataLength)}
          </span>{' '}
          of <span className="font-medium">{filteredDataLength}</span> results
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
  );
};

export default TablePagination;
