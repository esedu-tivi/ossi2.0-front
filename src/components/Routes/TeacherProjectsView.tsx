import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import "../../css/TeacherProjectsView.css";
import {
  TableBody,
  TableCell,
  TableRow,
  Button,
  Box,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import InfoIcon from "@mui/icons-material/Info";
import AssessmentIcon from "@mui/icons-material/Assessment";
import AddIcon from "@mui/icons-material/Add";
import { GET_PROJECTS } from "../../graphql/GetProjects";
import { Project } from "../../types";
import Table, { TableHeaderCell } from "../common/Table";

const headerCells: readonly TableHeaderCell[] = [
  {
    type: "sort",
    label: "ID#",
    sortPath: "id"
  },
  {
    type: "sort",
    label: "Projektin nimi",
    sortPath: "name"
  },
  {
    type: "sort",
    label: "Teemat",
    sortPath: "includedInQualificationUnitParts.name"
  },
  {
    type: "search"
  }
]

export default function ProjectTable() {
  const navigate = useNavigate();

  //GraphQL query to fetch projects
  const { loading, error, data } = useQuery(GET_PROJECTS);

  const [sortedProjects, setSortedProjects] = useState<Project[]>([])

  // If the data is still loading, display a loading message.
  // If there was an error fetching data, display the error message
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  // Extract the projects from the data object. If there are no projects, default to an empty array.
  const projects: Project[] = data?.projects.projects || [];

  return (
    <Box>
      <Box className="button-container">
        <Button
          variant="contained"
          color="primary"
          className="add-project-button"
          startIcon={<AddIcon />}
          onClick={() => navigate("/teacherprojects/new")}
        >
          Lisää Projekti
        </Button>
      </Box>
      <Table<Project> headerCells={headerCells} setSortedData={setSortedProjects} data={projects} filterField="name">
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
    </Box>
  );
}
