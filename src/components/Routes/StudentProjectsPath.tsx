import { useQuery } from "@apollo/client";
import { GET_STUDENT_PROJECTS } from "../../graphql/GetStudentProjects";
import { Box, List, ListItem, Typography } from '@mui/material';
import { ProjectStatus, StudentProject } from "./studentDashboard/types";
import EvaluateProject from "./evaluateProject";
import formStyles from "../../styles/formStyles";

const StudentProjectsPath = () => {
  const { loading, data, startPolling, stopPolling } = useQuery(GET_STUDENT_PROJECTS);
  if (loading || !data) {
    startPolling(500); // making sure data has loaded
    return (
      <Typography>loading</Typography>
    );
  };
  stopPolling();
  var assignedProjects = data.me.user.assignedProjects;
  console.log(assignedProjects)
  var startedProjects = assignedProjects.filter((p: StudentProject) => p.projectStatus === ProjectStatus.Working);
  var returnedProjects = assignedProjects.filter((p: StudentProject) => p.projectStatus === ProjectStatus.Returned);
  var acceptedProjects = assignedProjects.filter((p: StudentProject) => p.projectStatus === ProjectStatus.Accepted);

  return (
      <Box sx={formStyles.formOuterBox}>
        <Box sx={{ ...formStyles.formBannerBox, textAlign: 'center', marginBottom: 3, position: 'relative', borderTopLeftRadius: '0px' }}>
          <Typography variant="h5" color="white" fontWeight="bold">{data.me.user.firstName} {data.me.user.lastName}:n Projektit</Typography>
        </Box>   
      <Typography variant='h4' align='center' color='black'></Typography>
      <Typography variant='h6' align='center' color='black'>Työn ala</Typography>
      <List sx={{ overflow: 'auto', position: 'relative' }}>
        {startedProjects.map((project) => (
          <ListItem key={project.projectId}>
            <EvaluateProject project={project} studentId={data.me.user.id}></EvaluateProject>
          </ListItem>
        ))}
      </List>
      <Typography variant='h6' align='center' color='black'>Palautetut</Typography>
      <List sx={{ overflow: 'auto', position: 'relative' }}>
        {returnedProjects.map((project) => (
          <ListItem key={project.projectId}>
            <EvaluateProject project={project} studentId={data.me.user.id} ></EvaluateProject>
          </ListItem>
        ))}
      </List>
      <Typography variant='h6' align='center' color='black'>Valmiit</Typography>
      <List sx={{ overflow: 'auto', position: 'relative' }}>
        {acceptedProjects.map((project) => (
          <ListItem key={project.projectId}>
            <EvaluateProject project={project} studentId={data.me.user.id}></EvaluateProject>
          </ListItem>
        ))}
      </List>
    </Box>
  )
}
export default StudentProjectsPath;