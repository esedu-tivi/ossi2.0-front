import { useState, useEffect } from "react";
import { Box, Paper, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from "@mui/material"
import MuiTable from "@mui/material/Table"

import SearchIcon from "@mui/icons-material/Search"
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward"
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward"
import { sort, SortConfig } from "../../utils/sort";
import { filter } from "../../utils/filter";

export type TableHeaderCell =
  | {
    type: "search";
    searchPath: string;
  }
  | {
    type: "sort";
    label: string;
    sortPath: string;
  }

export interface TableProps<T> {
  headerCells: readonly TableHeaderCell[]
  children: React.ReactElement<typeof TableBody>
  data: T[]
  setSortedData: React.Dispatch<React.SetStateAction<T[]>>
}

type HeadProps<T> = Omit<TableProps<T>, "children">

const Head = <T,>({ headerCells, setSortedData, data }: HeadProps<T>) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState<T[]>([])

  const [sortConfig, setSortConfig] = useState<SortConfig>({
    column: null,
    order: null,
  })

  const searchPath = headerCells.find(cell => cell.type === "search")?.searchPath || null

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
  }

  useEffect(() => {
    if (searchPath) {
      setFilteredData(filter<T>(data, searchQuery, searchPath));
    }

  }, [data, searchQuery, setFilteredData, searchPath]);

  useEffect(() => {
    setSortedData(sort<T>(filteredData, sortConfig))
  }, [setSortedData, filteredData, sortConfig])

  const handleSort = (column: string | null) => {
    if (!column) return null
    setSortConfig((prevConfig) => {
      switch (prevConfig.order) {
        case ("asc"):
          return { column, order: "desc" }
        case ("desc"):
          return { column: null, order: null }

        default:
          return { column, order: "asc" }
      }
    })
  }
  return (
    <TableHead>
      <TableRow className="table-header">
        {headerCells.map((part: TableHeaderCell, index) => (part.type === "sort") ?
          <TableCell
            className="table-header-cell table-header-id"
            onClick={() => handleSort(part.sortPath)}
            key={index}
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
            <TableCell className="table-header-cell" key={index}>
              <div className="search-container">
                <SearchIcon />
                <TextField
                  placeholder="Hae…"
                  variant="outlined"
                  size="small"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
            </TableCell>
            : <></>
        )}
      </TableRow>
    </TableHead>
  )
}

const Table = <T,>({ headerCells, children, data, setSortedData }: TableProps<T>) => (
  <TableContainer component={Paper}>
    <MuiTable>
      <Head<T> headerCells={headerCells} data={data} setSortedData={setSortedData} />
      {children}
    </MuiTable>
  </TableContainer>
)

export default Table
