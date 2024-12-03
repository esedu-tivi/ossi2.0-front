import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import "../../css/TeacherProjectsView.css";
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
import AssessmentIcon from "@mui/icons-material/Assessment";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { GET_PROJECTS } from "../../graphql/GetProjects";

export interface Project {
  id: number;
  name: string;
  includedInQualificationUnitParts: { id: number; name: string }[];
}

export default function ProjectTable() {
  const navigate = useNavigate();

  const { loading, error, data } = useQuery(GET_PROJECTS);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    column: string | null;
    order: "asc" | "desc" | null;
  }>({ column: null, order: null });

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setSearchQuery(event.target.value);

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

  const projects: Project[] = data?.projects || [];
  const sortedProjects = [...projects]
    .filter(
      (project) =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.includedInQualificationUnitParts.some((part) =>
          part.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
    )
    .sort((a, b) => {
      if (sortConfig.order === null || sortConfig.column === null) return 0;
      let valueA, valueB;

      switch (sortConfig.column) {
        case "name":
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
          break;
        case "id":
          valueA = a.id;
          valueB = b.id;
          break;
        case "themes":
          valueA = a.includedInQualificationUnitParts
            .map((part) => part.name)
            .join(", ")
            .toLowerCase();
          valueB = b.includedInQualificationUnitParts
            .map((part) => part.name)
            .join(", ")
            .toLowerCase();
          break;
        default:
          return 0;
      }

      if (valueA > valueB) return sortConfig.order === "asc" ? 1 : -1;
      if (valueA < valueB) return sortConfig.order === "asc" ? -1 : 1;
      return 0;
    });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="project-table-container">
      <div className="button-container">
        <Button
          variant="contained"
          color="primary"
          className="add-project-button"
          startIcon={<AddIcon />}
          onClick={() => navigate("/teacherprojects/new")}
        >
          Lisää Projekti
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
                  ) : sortConfig.column === "id" && sortConfig.order === "desc" ? (
                    <ArrowDownwardIcon fontSize="small" />
                  ) : null}
                </div>
              </TableCell>
              <TableCell
                className="table-header-cell table-header-name"
                onClick={() => handleSort("name")}
              >
                <div className="sortable-header">
                  Projektin nimi
                  {sortConfig.column === "name" && sortConfig.order === "asc" ? (
                    <ArrowUpwardIcon fontSize="small" />
                  ) : sortConfig.column === "name" && sortConfig.order === "desc" ? (
                    <ArrowDownwardIcon fontSize="small" />
                  ) : null}
                </div>
              </TableCell>
              <TableCell
                className="table-header-cell table-header-theme"
                onClick={() => handleSort("themes")}
              >
                <div className="sortable-header">
                  Teemat
                  {sortConfig.column === "themes" && sortConfig.order === "asc" ? (
                    <ArrowUpwardIcon fontSize="small" />
                  ) : sortConfig.column === "themes" && sortConfig.order === "desc" ? (
                    <ArrowDownwardIcon fontSize="small" />
                  ) : null}
                </div>
              </TableCell>
              <TableCell className="table-header-cell">
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
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedProjects.map((project) => (
              <TableRow key={project.id} className="table-row">
                <TableCell>{project.id}</TableCell>
                <TableCell>{project.name}</TableCell>
                <TableCell>
                  {project.includedInQualificationUnitParts
                    .map((part) => part.name)
                    .join(", ")}
                </TableCell>
                <TableCell>
                  <div className="button-group">
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<EditIcon />}
                      size="small"
                      onClick={() => navigate(`/teacherprojects/edit/${project.id}`)}
                    >
                      Muokkaa
                    </Button>
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<InfoIcon />}
                      size="small"
                      onClick={() => navigate(`/teacherprojects/${project.id}`)}
                    >
                      Tiedot
                    </Button>
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<AssessmentIcon />}
                      size="small"
                    >
                      Käyttöaste
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
}
