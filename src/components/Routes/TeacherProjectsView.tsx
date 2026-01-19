import { useNavigate } from "react-router-dom";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import "../../css/TeacherProjectsView.css";
import {
  TableBody,
  TableCell,
  TableRow,
  Button,
  Box,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import InfoIcon from "@mui/icons-material/Info";
import AssessmentIcon from "@mui/icons-material/Assessment";
import AddIcon from "@mui/icons-material/Add";
import CheckedIcon from '@mui/icons-material/CheckCircle';
import UncheckedIcon from '@mui/icons-material/Cancel';
import { GET_PROJECTS } from "../../graphql/GetProjects";
import { Project } from "../../types";
import Table, { TableHeaderCell } from "../common/Table";
import { USER_SETUP } from "../../graphql/UserSetup";
import { useEffect } from "react";
import { GET_ASSIGNED_TEACHING_PROJECT_IDS } from "../../graphql/GetAssignedTeachingProjectIds";
import { UNASSIGN_TEACHING_PROJECT } from "../../graphql/UnassignTeachingProject";
import { ASSIGN_TEACHING_PROJECT } from "../../graphql/AssignTeachingProject";

const headerCells: readonly TableHeaderCell[] = [
  {
    id: 0,
    type: "sort",
    label: "ID#",
    sortPath: "id"
  },
  {
    id: 1,
    type: "sort",
    label: "Projektin nimi",
    sortPath: "name"
  },
  {
    id: 2,
    type: "sort",
    label: "Teemat",
    sortPath: "includedInQualificationUnitParts.name"
  },
  {
    id: 3,
    type: "none",
    label: "Projekti seurannassa"
  },
  {
    id: 4,
    type: "search",
    searchPath: "name"
  }
]

export default function ProjectTable() {
  const navigate = useNavigate();

  //GraphQL query to fetch projects
  const { loading: projectsLoading, error: projectsError, data: projectsData } = useQuery(GET_PROJECTS);

  const { loading: userLoading, error: userError, data: userData } = useQuery(USER_SETUP)
  const [fetchProjectIds, { loading: teachingProjectsLoading, data: teachingProjectsData, called: teachingProjectsCalled }] = useLazyQuery(GET_ASSIGNED_TEACHING_PROJECT_IDS)

  const [assignTeachingProject] = useMutation(ASSIGN_TEACHING_PROJECT, { refetchQueries: [GET_ASSIGNED_TEACHING_PROJECT_IDS] })
  const [unassignTeachingProject] = useMutation(UNASSIGN_TEACHING_PROJECT, { refetchQueries: [GET_ASSIGNED_TEACHING_PROJECT_IDS] })

  useEffect(() => {
    const fetchData = async () => {
      if (userData && !userLoading) {

        await fetchProjectIds({ variables: { teacherId: userData.me.user.id } })
      }
    }
    fetchData()
  }, [userData, userLoading, fetchProjectIds])

  const removeTeachingProjectHandler = async (id: number) => {
    console.log(id)
    await unassignTeachingProject({ variables: { teacherId: userData.me.user.id, projectId: id } })
  }

  const addTeachingProjectHandler = async (id: number) => {
    await assignTeachingProject({ variables: { teacherId: userData.me.user.id, projectId: id } })
  }

  // If the data is still loading, display a loading message.
  // If there was an error fetching data, display the error message
  if (projectsLoading || userLoading || teachingProjectsLoading) return <p>Loading...</p>;
  if (projectsError || userError) return <p>Error: {projectsError?.message || userError?.message}</p>;

  // Extract the projects from the data object. If there are no projects, default to an empty array.
  const projects: Project[] = projectsData?.projects.projects || [];

  const teachingProjectsIds = teachingProjectsCalled ? teachingProjectsData.assignedTeachingProjects?.assignedProjects.map((project: Pick<Project, "id">) => project.id) : []

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
      <Table<Project> headerCells={headerCells} data={projects}>
        {rows =>
          <TableBody>
            {rows.map((project) => (
              <TableRow key={project.id} className="table-row">
                <TableCell>{project.id}</TableCell>
                <TableCell>{project.name}</TableCell>
                <TableCell>
                  {project.includedInQualificationUnitParts
                    .map((part) => part.name)
                    .join(", ")}
                </TableCell>
                <TableCell>
                  {teachingProjectsIds.includes(project.id)
                    ? <IconButton onClick={() => removeTeachingProjectHandler(project.id)}><CheckedIcon color="success" /></IconButton>
                    : <IconButton onClick={() => addTeachingProjectHandler(project.id)}><UncheckedIcon color="error" /></IconButton>
                  }
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
          </TableBody>}
      </Table>
    </Box >
  );
}
