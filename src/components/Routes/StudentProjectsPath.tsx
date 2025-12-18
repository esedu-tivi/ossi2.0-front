import { useQuery } from "@apollo/client";
import { Box, List, ListItem, Typography } from '@mui/material';
import { AssignedProject, ProjectStatus, Student } from "../../types";
import EvaluateProject from "./evaluateProject";
import formStyles from "../../styles/formStyles";
import { GET_STUDENT_PROJECTS_BY_STUDENT_ID } from "../../graphql/GetStudentProjectsByStudentId";
import { useParams } from "react-router-dom";

const StudentProjectsPath = ({ student }: { student: Student }) => {
  const { studentId } = useParams()

  const { loading, data, startPolling, stopPolling } = useQuery(GET_STUDENT_PROJECTS_BY_STUDENT_ID, { variables: { studentId } });
  if (loading || !data) {
    startPolling(500); // making sure data has loaded
    return (
      <Typography>loading</Typography>
    );
  };
  stopPolling();

  const assignedProjects: AssignedProject[] = data.assignedStudentProjects?.assignedProjects || [];
  console.log(assignedProjects)
  const startedProjects = assignedProjects.filter((p) => p.projectStatus === ProjectStatus.Working);
  const returnedProjects = assignedProjects.filter((p) => p.projectStatus === ProjectStatus.Returned);
  const acceptedProjects = assignedProjects.filter((p) => p.projectStatus === ProjectStatus.Accepted);

  return (
    <Box sx={formStyles.formOuterBox}>
      <Box sx={{ ...formStyles.formBannerBox, textAlign: 'center', marginBottom: 3, position: 'relative', borderTopLeftRadius: '0px' }}>
        <Typography variant="h5" color="white" fontWeight="bold">{student.firstName} {student.lastName}:n Projektit</Typography>
      </Box>
      <Typography variant='h6' align='center' color='black'>Työn ala</Typography>
      <List sx={{ overflow: 'auto', position: 'relative' }}>
        {startedProjects.map((project) => (
          <ListItem key={project.projectId}>
            <EvaluateProject project={project} studentId={student.id} />
          </ListItem>
        ))}
      </List>
      <Typography variant='h6' align='center' color='black'>Palautetut</Typography>
      <List sx={{ overflow: 'auto', position: 'relative' }}>
        {returnedProjects.map((project) => (
          <ListItem key={project.projectId}>
            <EvaluateProject project={project} studentId={student.id} />
          </ListItem>
        ))}
      </List>
      <Typography variant='h6' align='center' color='black'>Valmiit</Typography>
      <List sx={{ overflow: 'auto', position: 'relative' }}>
        {acceptedProjects.map((project) => (
          <ListItem key={project.projectId}>
            <EvaluateProject project={project} studentId={student.id} />
          </ListItem>
        ))}
      </List>
    </Box>
  )
}
export default StudentProjectsPath;