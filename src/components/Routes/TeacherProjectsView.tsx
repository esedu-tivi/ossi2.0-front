import { useNavigate } from "react-router-dom";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Info, BarChart3, CheckCircle, XCircle } from "lucide-react";
import { GET_PROJECTS } from "@/graphql/GetProjects";
import { Project } from "@/types";
import DataTable, { type TableHeaderCell } from "@/components/common/data-table";
import { USER_SETUP } from "@/graphql/UserSetup";
import { useEffect } from "react";
import { GET_ASSIGNED_TEACHING_PROJECT_IDS } from "@/graphql/GetAssignedTeachingProjectIds";
import { UNASSIGN_TEACHING_PROJECT } from "@/graphql/UnassignTeachingProject";
import { ASSIGN_TEACHING_PROJECT } from "@/graphql/AssignTeachingProject";

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
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => navigate("/teacherprojects/new")}>
          <Plus />
          Lis&auml;&auml; Projekti
        </Button>
      </div>
      {teachingProjectsError && (
        <p className="text-sm text-destructive">Projektien seurantatietoja ei voitu ladata.</p>
      )}
      <DataTable<Project> headerCells={headerCells} data={projects}>
        {rows =>
          <TableBody>
            {rows.map((project) => (
              <TableRow key={project.id}>
                <TableCell>{project.id}</TableCell>
                <TableCell>{project.name}</TableCell>
                <TableCell>
                  {project.includedInQualificationUnitParts
                    .map((part) => part.name)
                    .join(", ")}
                </TableCell>
                <TableCell>
                  {teachingProjectsError ? (
                    <XCircle className="h-5 w-5 text-destructive" />
                  ) : teachingProjectsIds.includes(project.id) ? (
                    <button
                      onClick={() => removeTeachingProjectHandler(project.id)}
                      className="inline-flex items-center justify-center rounded-md p-1 hover:bg-accent"
                    >
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </button>
                  ) : (
                    <button
                      onClick={() => addTeachingProjectHandler(project.id)}
                      className="inline-flex items-center justify-center rounded-md p-1 hover:bg-accent"
                    >
                      <XCircle className="h-5 w-5 text-destructive" />
                    </button>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/teacherprojects/edit/${project.id}`)}
                    >
                      <Pencil />
                      Muokkaa
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/teacherprojects/${project.id}`)}
                    >
                      <Info />
                      Tiedot
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                    >
                      <BarChart3 />
                      K&auml;ytt&ouml;aste
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>}
      </DataTable>
    </div>
  );
}
