import { useState, useMemo } from 'react';
import { Search, ArrowUp, ArrowDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { sort, type SortConfig } from '@/utils/sort';
import { filter } from '@/utils/filter';

export type TableHeaderCell =
  | {
      id: number | string;
      type: 'search';
      searchPath: string;
    }
  | {
      id: number | string;
      type: 'sort';
      label: string;
      sortPath: string;
    }
  | {
      id: number | string;
      type: 'none';
      label: string;
    }
  | {
      id: number | string;
      type: 'group';
      label: string;
      colSpan: number;
    };

export interface DataTableProps<T> {
  headerCells: readonly TableHeaderCell[];
  children:
    | React.ReactElement<typeof TableBody>
    | ((data: T[]) => React.ReactNode);
  data: T[];
}

interface DataTableHeadProps {
  headerCells: readonly TableHeaderCell[];
  searchQuery: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  sortConfig: SortConfig;
  onSortChange: React.Dispatch<React.SetStateAction<SortConfig>>;
}

const DataTableHead = ({
  headerCells,
  searchQuery,
  onSearchChange,
  sortConfig,
  onSortChange,
}: DataTableHeadProps) => {
  const handleSort = (column: string | null) => {
    if (!column) return;

    onSortChange((prev: SortConfig) => {
      switch (prev.order) {
        case 'asc':
          return { column, order: 'desc' };
        case 'desc':
          return { column: null, order: null };
        default:
          return { column, order: 'asc' };
      }
    });
  };

  const groupHeaders = headerCells.filter((cell) => cell.type === 'group');
  const hasGroups = groupHeaders.length > 0;

  return (
    <TableHeader>
      {hasGroups && (
        <TableRow className="bg-muted/50">
          {groupHeaders.map((group) => (
            <TableHead
              key={group.id}
              colSpan={'colSpan' in group ? group.colSpan : undefined}
              className="text-center font-semibold"
            >
              {'label' in group ? group.label : ''}
            </TableHead>
          ))}
        </TableRow>
      )}
      <TableRow className="bg-muted/50">
        {headerCells.map((cell) => {
          if (cell.type === 'group') return null;

          if (cell.type === 'sort') {
            return (
              <TableHead
                key={cell.id}
                className="cursor-pointer select-none"
                onClick={() => handleSort(cell.sortPath)}
              >
                <div className="flex items-center gap-1">
                  {cell.label}
                  {sortConfig.column === cell.sortPath &&
                  sortConfig.order === 'asc' ? (
                    <ArrowUp className="h-4 w-4" />
                  ) : sortConfig.column === cell.sortPath &&
                    sortConfig.order === 'desc' ? (
                    <ArrowDown className="h-4 w-4" />
                  ) : null}
                </div>
              </TableHead>
            );
          }

          if (cell.type === 'search') {
            return (
              <TableHead key={cell.id}>
                <div className="relative flex items-center">
                  <Search className="absolute left-2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Hae..."
                    value={searchQuery}
                    onChange={onSearchChange}
                    className="h-8 pl-8"
                  />
                </div>
              </TableHead>
            );
          }

          if (cell.type === 'none') {
            return <TableHead key={cell.id}>{cell.label}</TableHead>;
          }

          return null;
        })}
      </TableRow>
    </TableHeader>
  );
};

const DataTable = <T,>({
  headerCells,
  children,
  data,
}: DataTableProps<T>) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    column: null,
    order: null,
  });

  const searchPath =
    headerCells.find((cell) => cell.type === 'search')?.searchPath ?? null;

  const filteredData = useMemo(() => {
    if (!searchPath) return data;
    return filter<T>(data, searchQuery, searchPath);
  }, [data, searchQuery, searchPath]);

  const sortedData = useMemo(() => {
    return sort<T>(filteredData, sortConfig);
  }, [filteredData, sortConfig]);

  return (
    <div className="rounded-md border">
      <Table>
        <DataTableHead
          headerCells={headerCells}
          searchQuery={searchQuery}
          onSearchChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            setSearchQuery(event.target.value)
          }
          sortConfig={sortConfig}
          onSortChange={setSortConfig}
        />
        {typeof children === 'function' ? children(sortedData) : children}
      </Table>
    </div>
  );
};

export default DataTable;
