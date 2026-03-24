import { useNavigate } from "react-router-dom";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import "../../css/TeacherProjectsView.css";
import {TableBody, TableCell, TableRow, Button, Box, IconButton, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CheckedIcon from '@mui/icons-material/CheckCircle';
import UncheckedIcon from '@mui/icons-material/Cancel';
import { GET_PROJECTS } from "../../graphql/GetProjects";
import { Project } from "../../types";
import Table, { TableHeaderCell } from "../common/Table";
import { USER_SETUP } from "../../graphql/UserSetup";
import { useEffect, useState } from "react";
import { GET_ASSIGNED_TEACHING_PROJECT_IDS } from "../../graphql/GetAssignedTeachingProjectIds";
import { UNASSIGN_TEACHING_PROJECT } from "../../graphql/UnassignTeachingProject";
import { ASSIGN_TEACHING_PROJECT } from "../../graphql/AssignTeachingProject";
import TeacherProjectMenu from "../common/TeacherProjectMenu";
import { COLOR_OPTIONS } from '../../constants/options';
import { GET_PROJECT_TAGS } from '../../graphql/GetProjectTags';
import { UPDATE_PROJECT } from '../../graphql/UpdateProject';
import { UPDATE_PROJECT_TAG } from '../../graphql/UpdateProjectTag';
import DeleteIcon from '@mui/icons-material/Close';
import TagStudentDialog from "../common/TagStudentDialog";
import { GET_STUDENTS } from '../../graphql/GetStudents';

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
    type: "none",
    label: "Tunnisteet"
  },
  {
    id: 3,
    type: "sort",
    label: "Teemat",
    sortPath: "includedInQualificationUnitParts.name"
  },
  {
    id: 4,
    type: "none",
    label: "Projekti seurannassa"
  },
  {
    id: 5,
    type: "search",
    searchPath: "name"
  },
]

type Student = {
  id: string;
  firstName: string;
  lastName: string;
};

export default function ProjectTable() {
  const [updateProject] = useMutation(UPDATE_PROJECT, {
    refetchQueries: [{ query: GET_PROJECTS }],
  });
  const [updateProjectTag] = useMutation(UPDATE_PROJECT_TAG, {
    refetchQueries: [{ query: GET_PROJECT_TAGS }],
  });
  const { data: allTagsData } = useQuery(GET_PROJECT_TAGS);
  const allTags = allTagsData?.projectTags?.projectTags || [];
  const { data: studentsData } = useQuery(GET_STUDENTS);
  const students = (studentsData?.students?.students || []).map((s: Student) => ({
    id: s.id,
    name: `${s.firstName} ${s.lastName}`.trim(),
  }));
  const [taggedStudentsByProject, setTaggedStudentsByProject] = useState<{ [projectId: number]: { id: string, name: string }[] }>(() => {
    const stored = localStorage.getItem('taggedStudentsByProject');
    return stored ? JSON.parse(stored) : {};
  });
    useEffect(() => {
      localStorage.setItem('taggedStudentsByProject', JSON.stringify(taggedStudentsByProject));
    }, [taggedStudentsByProject]);
  const [tagDialogOpenByProject, setTagDialogOpenByProject] = useState<{ [projectId: number]: boolean }>({});
  const navigate = useNavigate();

  //GraphQL query to fetch projects
  const { loading: projectsLoading, error: projectsError, data: projectsData } = useQuery(GET_PROJECTS);
  const { loading: userLoading, error: userError, data: userData } = useQuery(USER_SETUP)

  const [fetchProjectIds, { loading: teachingProjectsLoading, data: teachingProjectsData, called: teachingProjectsCalled, error: teachingProjectsError }] = useLazyQuery(GET_ASSIGNED_TEACHING_PROJECT_IDS)

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

  const teachingProjectsIds = teachingProjectsCalled && teachingProjectsData ? teachingProjectsData.assignedTeachingProjects?.assignedProjects.map((project: Pick<Project, "id">) => project.id) : []

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
      {teachingProjectsError && <Box><Typography>Teaching project error: {teachingProjectsError.message}</Typography></Box>}
      <Table<Project> headerCells={headerCells} data={projects}>
        {rows =>
          <TableBody>
            {/* If no results match the search query, display a message */}
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={headerCells.length} align="center">
                  Ei tuloksia
                </TableCell>
              </TableRow>
            ) : (
              rows.map((project) => {
                const taggedStudents = taggedStudentsByProject[project.id] || [];
                const tagList = project.tags || [];
                return (
                  <TableRow key={project.id} className="table-row">
                    <TableCell>{project.id}</TableCell>
                    <TableCell>
                      {project.name}
                    </TableCell>
                    {/* Tags column */}
                    <TableCell>
                      {tagList.length > 0 && tagList.map((tag, idx) => {
                        const defaultColor = '#accecc';
                        const color = tag.color || defaultColor;
                        return (
                          <span key={(tag.id ? String(tag.id) : tag.name + idx)} style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            marginRight: 8,
                            padding: '2px 8px',
                            borderRadius: 8,
                            background: color,
                            fontSize: 12,
                            marginBottom: 4,
                            color: '#222',
                            border: '1px solid #2c2b2b',
                            position: 'relative'
                          }}>
                            {tag.name}
                            <IconButton
                              size="small"
                              aria-label="Poista tunniste"
                              onClick={async (e) => {
                                e.stopPropagation();
                                const currentTags = project.tags || [];
                                const newTags = currentTags.filter((t) => t.id !== tag.id);
                                try {
                                  await updateProject({
                                    variables: {
                                      updateProjectId: project.id,
                                      project: {
                                        name: project.name,
                                        description: project.description,
                                        materials: project.materials,
                                        duration: Number(project.duration),
                                        includedInParts: project.includedInQualificationUnitParts.map((p) => p.id),
                                        competenceRequirements: project.competenceRequirements?.map((c) => c.id) || [],
                                        tags: newTags.map((t) => t.id),
                                        isActive: project.isActive,
                                      },
                                    },
                                  });
                                } catch (e) {
                                  console.error('Tunnisteen poisto epäonnistui', e);
                                }
                              }}
                              sx={{ ml: 0.5, p: 0, width: 5, height: 5, minWidth: 5, minHeight: 5 }}
                            >
                              <DeleteIcon sx={{ fontSize: 10, color: '#b71c1c' }} />
                            </IconButton>
                          </span>
                        );
                      })}
                    </TableCell>
                    <TableCell>
                      {project.includedInQualificationUnitParts
                        .map((part) => part.name)
                        .join(", ")}
                    </TableCell>
                    <TableCell>
                      {teachingProjectsError ? <UncheckedIcon color="error" /> : teachingProjectsIds.includes(project.id)
                        ? <IconButton onClick={() => removeTeachingProjectHandler(project.id)}><CheckedIcon color="success" /></IconButton>
                        : <IconButton onClick={() => addTeachingProjectHandler(project.id)}><UncheckedIcon color="error" /></IconButton>
                      }
                    </TableCell>
                    <TableCell>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }} className="button-group">
                        <TeacherProjectMenu
                          isFollowed={teachingProjectsIds.includes(project.id)}
                          onFollowToggle={() => {
                            if (teachingProjectsIds.includes(project.id)) {
                              removeTeachingProjectHandler(project.id);
                            } else {
                              addTeachingProjectHandler(project.id);
                            }
                          }}
                          onEdit={() => navigate(`/teacherprojects/edit/${project.id}`)}
                          onTagStudent={() => setTagDialogOpenByProject(prev => ({ ...prev, [project.id]: true }))}
                          project={project}
                          allTags={allTags}
                          onAddTag={async (tag) => {
                            const currentTags = project.tags || [];
                            if (currentTags.some((t) => t.id === tag.id)) return;
                            try {
                              await updateProject({
                                variables: {
                                  updateProjectId: project.id,
                                  project: {
                                    name: project.name,
                                    description: project.description,
                                    materials: project.materials,
                                    duration: Number(project.duration),
                                    includedInParts: project.includedInQualificationUnitParts.map((p) => p.id),
                                    competenceRequirements: project.competenceRequirements?.map((c) => c.id) || [],
                                    tags: [...currentTags.map((t) => t.id), tag.id],
                                    isActive: project.isActive,
                                  },
                                },
                              });
                            } catch (e) {
                              console.error('Tunnisteen lisäys epäonnistui', e);
                            }
                          }}
                          onColorChange={async (tagId, colorId) => {
                            const colorObj = COLOR_OPTIONS.find(c => c.id === colorId);
                            try {
                              await updateProjectTag({
                                variables: { id: Number(tagId), color: colorObj ? colorObj.color : colorId },
                                refetchQueries: [{ query: GET_PROJECT_TAGS }],
                                awaitRefetchQueries: true
                              });
                            } catch (e) {
                              // Optionally: show error to user
                              console.error('Värin tallennus epäonnistui', e);
                            }
                          }}
                        />
                      </div>
                    </TableCell>
                    <TagStudentDialog
                      open={!!tagDialogOpenByProject[project.id]}
                      onClose={() => setTagDialogOpenByProject(prev => ({ ...prev, [project.id]: false }))}
                      students={students}
                      taggedStudents={taggedStudents}
                      onTag={selectedList => setTaggedStudentsByProject(prev => ({ ...prev, [project.id]: selectedList }))}
                    />
                  </TableRow>
                );
              })
            )}
          </TableBody>}
      </Table>
    </Box >
  );
}
