import { useState, useMemo } from "react";
import { Box, Paper, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from "@mui/material"
import MuiTable from "@mui/material/Table"

import SearchIcon from "@mui/icons-material/Search"
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward"
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward"
import { sort, SortConfig } from "../../utils/sort";
import { filter } from "../../utils/filter";

import "../../css/Table.css";

export type TableHeaderCell =
  | {
    id: number | string
    type: "search"
    searchPath: string
  }
  | {
    id: number | string
    type: "sort"
    label: string
    sortPath: string
  }
  | {
    id: number | string
    type: "none"
    label: string
  }
  | {
    id: number | string
    type: "group"
    label: string
    colSpan: number
  }

export interface TableProps<T> {
  headerCells: readonly TableHeaderCell[]
  children: React.ReactElement<typeof TableBody> | ((data: T[]) => React.ReactNode)
  data: T[]
}

interface HeadProps {
  headerCells: readonly TableHeaderCell[]
  searchQuery: string
}

const Head = ({
  headerCells,
  searchQuery,
  onSearchChange,
  sortConfig,
  onSortChange
}: HeadProps & {
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void,
  sortConfig: SortConfig,
  onSortChange: React.Dispatch<React.SetStateAction<SortConfig>>
}) => {
  const handleSort = (column: string | null) => {
    if (!column) return;

    onSortChange((prev: SortConfig) => {
      switch (prev.order) {
        case "asc":
          return { column, order: "desc" };
        case "desc":
          return { column: null, order: null };
        default:
          return { column, order: "asc" };
      }
    });
  };

  const tableGroupData = headerCells.filter(cell => cell.type === "group")

  return (
    <TableHead>
      <TableRow className="table-header">
        {tableGroupData.map(group =>
          <TableCell
            align="center"
            className="table-header-cell"
            colSpan={group.colSpan}
            key={group.id}
          >
            {group.label}
          </TableCell>
        )}
      </TableRow>
      <TableRow className="table-header">
        {headerCells.map((part: TableHeaderCell) => (part.type === "sort") ?
          <TableCell
            className={`table-header-cell ${part.sortPath === "id" && "table-header-id"}`}
            onClick={() => handleSort(part.sortPath)}
            key={part.id}
          >
            <Box className="sortable-header">
              {part.label}
              {sortConfig.column === part.sortPath && sortConfig.order === "asc" ? (
                <ArrowUpwardIcon fontSize="small" />
              ) : sortConfig.column === part.sortPath && sortConfig.order === "desc" ? (
                <ArrowDownwardIcon fontSize="small" />
              ) : null}
            </Box>
          </TableCell>
          : (part.type === "search") ?
            <TableCell className="table-header-cell" key={part.id}>
              <div className="search-container">
                <SearchIcon />
                <TextField
                  placeholder="Hae…"
                  variant="outlined"
                  size="small"
                  value={searchQuery}
                  onChange={onSearchChange}
                />
              </div>
            </TableCell>
            : (part.type === "none") ?
              <TableCell className="table-header-cell" key={part.id}>
                {part.label}
              </TableCell>
              : null
        )}
      </TableRow>
    </TableHead>
  )
}

const Table = <T,>({ headerCells, children, data }: TableProps<T>) => {
  const [searchQuery, setSearchQuery] = useState("");

  const [sortConfig, setSortConfig] = useState<SortConfig>({
    column: null,
    order: null,
  });

  const searchPath =
    headerCells.find(cell => cell.type === "search")?.searchPath ?? null;

  const filteredData = useMemo(() => {
    if (!searchPath) return data;
    return filter<T>(data, searchQuery, searchPath);
  }, [data, searchQuery, searchPath]);

  const sortedData = useMemo(() => {
    return sort<T>(filteredData, sortConfig);
  }, [filteredData, sortConfig]);

  return (
    <TableContainer component={Paper}>
      <MuiTable>
        <Head
          headerCells={headerCells}
          searchQuery={searchQuery}
          onSearchChange={(event: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(event.target.value)}
          sortConfig={sortConfig}
          onSortChange={setSortConfig}
        />
        {typeof children === "function"
          ? children(sortedData)
          : children}
      </MuiTable>
    </TableContainer>
  )
}

export default Table
