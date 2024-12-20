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
import { Project, SortConfig, filterProjects, sortProjects } from "../common/teacherHelpers";

export default function ProjectTable() {
  const navigate = useNavigate();

  //GraphQL query to fetch projects
  const { loading, error, data } = useQuery(GET_PROJECTS);


  // State for controlling the search query entered by the user
  const [searchQuery, setSearchQuery] = useState("");

  // State that holds the current filtering configs.
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    column: null,
    order: null,
  });

  //Update the search query state as the user types in the search field.
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setSearchQuery(event.target.value);

  // Update the sorting configuration when a column header is clicked.
  // If the column is already sorted by, change the order ascending -> descending -> none.
  const handleSort = (column: string) => {
    setSortConfig((prevConfig) => {
      if (prevConfig.column !== column) {
        // If we're sorting by a new column, start with ascending order
        return { column, order: "asc" };
      }

      // If we're sorting the same column, cycle through the sort orders
      if (prevConfig.order === "asc") {
        return { column, order: "desc" };
      }

      // Remove sorting if clicked again
      if (prevConfig.order === "desc") {
        return { column: null, order: null };
      }

      return { column, order: "asc" };
    });
  };

  // If the data is still loading, display a loading message.
  // If there was an error fetching data, display the error message
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  // Extract the projects from the data object. If there are no projects, default to an empty array.
  const projects: Project[] = data?.projects || [];

  // Filter and sort the projects based on the search query and sorting configuration in the helper file.
  const filteredProjects = filterProjects(projects, searchQuery);

  // Sort the already filtered projects according to the chosen column and order
  const sortedProjects = sortProjects(filteredProjects, sortConfig);

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
