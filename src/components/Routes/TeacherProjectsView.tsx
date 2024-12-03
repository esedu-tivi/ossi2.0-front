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
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setSearchQuery(event.target.value);

  const handleSortByName = () => {
    setSortOrder((prevOrder) => {
      if (prevOrder === "asc") return "desc";
      if (prevOrder === "desc") return null;
      return "asc";
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
      if (sortOrder === null) return 0; // No sorting
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (sortOrder === "asc") return nameA > nameB ? 1 : -1;
      return nameA < nameB ? 1 : -1;
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
              <TableCell className="table-header-cell table-header-id">
                ID#
              </TableCell>
              <TableCell
                className="table-header-cell table-header-name"
                onClick={handleSortByName}
              >
                <div className="sortable-header">
                  Projektin nimi
                  {sortOrder === "asc" ? (
                    <ArrowUpwardIcon fontSize="small" />
                  ) : sortOrder === "desc" ? (
                    <ArrowDownwardIcon fontSize="small" />
                  ) : null}
                </div>
              </TableCell>
              <TableCell className="table-header-cell table-header-theme">
                Teemat
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
                      onClick={() => navigate(`/teacherprojects/${project.id}`)} // Navigate to project details
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
