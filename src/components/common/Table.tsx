import { useState } from "react";
import { Paper, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from "@mui/material"
import MuiTable from "@mui/material/Table"

import SearchIcon from "@mui/icons-material/Search"
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward"
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward"

import { SortConfig } from "./teacherHelpers"

export interface TableHeaderPart {
  name: string;
  title?: string;
  type: "search" | "sort";
}

export interface TableProps {
  headerParts: TableHeaderPart[]
  children: React.ReactElement<typeof TableBody>
}

const Head = ({ headerParts }: { headerParts: TableHeaderPart[] }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const [sortConfig, setSortConfig] = useState<SortConfig>({
    column: null,
    order: null,
  })

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
  }

  const handleSort = (column: string) => {
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
        {headerParts.map((part: TableHeaderPart, index) => (part.type === "sort") ?
          <TableCell
            className="table-header-cell table-header-id"
            onClick={() => handleSort(part.name)}
            key={index}
          >
            <div className="sortable-header">
              {part.title}
              {sortConfig.column === part.name && sortConfig.order === "asc" ? (
                <ArrowUpwardIcon fontSize="small" />
              ) : sortConfig.column === part.name && sortConfig.order === "desc" ? (
                <ArrowDownwardIcon fontSize="small" />
              ) : null}
            </div>
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

const Table = ({ headerParts, children }: TableProps) => (
  <TableContainer component={Paper}>
    <MuiTable>
      <Head headerParts={headerParts} />
      {children}
    </MuiTable>
  </TableContainer>
)

export default Table
