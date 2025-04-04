import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import InfoIcon from "@mui/icons-material/Info";
import SearchIcon from "@mui/icons-material/Search";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import AddIcon from "@mui/icons-material/Add";
import "../css/QualificationUnitPartsList.css";
import { GET_QUALIFICATION_UNIT_PARTS } from "../graphql/GetQualificationUnitParts";
import buttonStyles from '../styles/buttonStyles';

type QualificationUnitPartData = {
  id: number;
  name: string;
  qualificationUnit: string;
};

const QualificationUnitPartList: React.FC = () => {
  const { loading, error, data } = useQuery(GET_QUALIFICATION_UNIT_PARTS);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const [sortConfig, setSortConfig] = useState<{
    column: string | null;
    order: "asc" | "desc" | null;
  }>({ column: null, order: null });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const parts: QualificationUnitPartData[] = data?.parts || [];

  // Handle search input changes
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setSearchQuery(event.target.value);

  // Handle sorting logic
  const handleSort = (column: string) => {
    setSortConfig((prevConfig) => {
      if (prevConfig.column !== column) {
        return { column, order: "asc" };
      }

      if (prevConfig.order === "asc") {
        return { column, order: "desc" };
      }
      if (prevConfig.order === "desc") {
        return { column: null, order: null };
      }
      return { column, order: "asc" };
    });
  };

  const filteredParts = parts.filter((part) =>
    part.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedParts = [...filteredParts].sort((a, b) => {
    if (sortConfig.order === null || sortConfig.column === null) return 0;
    let valueA, valueB;

    switch (sortConfig.column) {
      case "id":
        valueA = a.id;
        valueB = b.id;
        break;
      case "name":
        valueA = a.name.toLowerCase();
        valueB = b.name.toLowerCase();
        break;
      case "qualificationUnit":
        valueA = a.qualificationUnit.toLowerCase();
        valueB = b.qualificationUnit.toLowerCase();
        break;
      default:
        return 0;
    }

    if (valueA > valueB) return sortConfig.order === "asc" ? 1 : -1;
    if (valueA < valueB) return sortConfig.order === "asc" ? -1 : 1;
    return 0;
  });

  return (
    <div className="qualification-unit-parts-container">
      <div className="button-container">
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          sx={{ ...buttonStyles.cancelButton, mr: 2 }}
          onClick={() => navigate("/qualificationunitparts/new")}
        >
          Lisää Teema
        </Button>

        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          sx={buttonStyles.cancelButton}
          onClick={() => navigate("/teacherdashboard/reorderparts")}
        >
          Järjestele Teemoja
      </Button>
      </div>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow className="table-header">
              <TableCell
                className="table-header-cell table-header-id"
                onClick={() => handleSort("id")}
              >
                <div className="sortable-header">
                  ID#
                  {sortConfig.column === "id" && sortConfig.order === "asc" ? (
                    <ArrowUpwardIcon fontSize="small" />
                  ) : sortConfig.column === "id" &&
                    sortConfig.order === "desc" ? (
                    <ArrowDownwardIcon fontSize="small" />
                  ) : null}
                </div>
              </TableCell>
              <TableCell
                className="table-header-cell table-header-teeman-aihe"
                onClick={() => handleSort("name")}
              >
                <div className="sortable-header">
                  Teeman aihe
                  {sortConfig.column === "name" &&
                  sortConfig.order === "asc" ? (
                    <ArrowUpwardIcon fontSize="small" />
                  ) : sortConfig.column === "name" &&
                    sortConfig.order === "desc" ? (
                    <ArrowDownwardIcon fontSize="small" />
                  ) : null}
                </div>
              </TableCell>
              <TableCell
                className="table-header-cell table-header-tutkinnonosa"
                onClick={() => handleSort("qualificationUnit")}
              >
                <div className="sortable-header">
                  Tutkinnonosa
                  {sortConfig.column === "qualificationUnit" &&
                  sortConfig.order === "asc" ? (
                    <ArrowUpwardIcon fontSize="small" />
                  ) : sortConfig.column === "qualificationUnit" &&
                    sortConfig.order === "desc" ? (
                    <ArrowDownwardIcon fontSize="small" />
                  ) : null}
                </div>
              </TableCell>
              <TableCell className="table-header-cell">
                <div className="search-container">
                  <SearchIcon />
                  <TextField
                    placeholder="Hae"
                    variant="outlined"
                    size="small"
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </div>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedParts.map((part) => (
              <TableRow key={part.id} className="table-row">
                <TableCell>{part.id}</TableCell>
                <TableCell>{part.name}</TableCell>
                <TableCell>{part.qualificationUnit}</TableCell>
                <TableCell>
                  <div className="button-group">
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => navigate(`/qualificationunitparts/edit/${part.id}`)}
                    >
                      Muokkaa
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<InfoIcon />}
                      onClick={() => navigate(`/qualificationunitparts/${part.id}`)}
                    >
                      Tiedot
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default QualificationUnitPartList;
