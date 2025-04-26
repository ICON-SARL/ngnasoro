
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  maxDisplayedPages?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  maxDisplayedPages = 5,
}) => {
  if (totalPages <= 1) return null;

  // Calculate the range of page numbers to display
  const getPageNumbers = () => {
    const range: number[] = [];
    const halfDisplay = Math.floor(maxDisplayedPages / 2);
    
    let startPage = Math.max(1, currentPage - halfDisplay);
    let endPage = Math.min(totalPages, startPage + maxDisplayedPages - 1);
    
    // Adjust start page if end page is at the limit
    if (endPage === totalPages) {
      startPage = Math.max(1, endPage - maxDisplayedPages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      range.push(i);
    }
    
    return range;
  };

  const pageNumbers = getPageNumbers();
  
  return (
    <div className="flex items-center justify-center space-x-1">
      {showFirstLast && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="h-8 w-8 p-0"
        >
          <span className="sr-only">Première page</span>
          <ChevronsLeft className="h-4 w-4" />
        </Button>
      )}
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-8 w-8 p-0"
      >
        <span className="sr-only">Page précédente</span>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      {pageNumbers[0] > 1 && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            className="h-8 w-8 p-0"
          >
            1
          </Button>
          {pageNumbers[0] > 2 && (
            <span className="px-2 text-gray-400">...</span>
          )}
        </>
      )}
      
      {pageNumbers.map(number => (
        <Button
          key={number}
          variant={currentPage === number ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(number)}
          className="h-8 w-8 p-0"
        >
          {number}
        </Button>
      ))}
      
      {pageNumbers[pageNumbers.length - 1] < totalPages && (
        <>
          {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
            <span className="px-2 text-gray-400">...</span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            className="h-8 w-8 p-0"
          >
            {totalPages}
          </Button>
        </>
      )}
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-8 w-8 p-0"
      >
        <span className="sr-only">Page suivante</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
      
      {showFirstLast && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="h-8 w-8 p-0"
        >
          <span className="sr-only">Dernière page</span>
          <ChevronsRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
