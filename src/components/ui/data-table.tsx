
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2 } from 'lucide-react';

interface DataTableProps<TData, TValue> {
  columns: {
    header: string;
    accessorKey?: string;
    cell?: (info: any) => React.ReactNode;
  }[];
  data: TData[];
  isLoading?: boolean;
  noResultsMessage?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  noResultsMessage = "Aucun résultat"
}: DataTableProps<TData, TValue>) {
  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-[#0D6A51]" />
      </div>
    );
  }

  // Handle empty data
  if (!data.length) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-muted-foreground">{noResultsMessage}</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column, index) => (
            <TableHead key={index}>
              {column.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row: any, rowIndex) => (
          <TableRow key={rowIndex}>
            {columns.map((column, colIndex) => (
              <TableCell key={`${rowIndex}-${colIndex}`}>
                {column.cell 
                  ? column.cell({ getValue: () => row[column.accessorKey || ''], row: { original: row } })
                  : column.accessorKey 
                    ? row[column.accessorKey] 
                    : null}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
