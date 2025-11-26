import { useQuery } from "@apollo/client";
import { useLocation, useNavigate } from "react-router-dom";
import { GET_STUDENT_PROJECTS } from "../../graphql/GetStudentProjects";
import { Box, List, ListItem,  Typography, Tab, Tabs } from '@mui/material';
import { ProjectStatus, StudentProject } from "./studentDashboard/types";
import EvaluateProject from "./evaluateProject";

const StudentProjectsPath = () =>{
    const navigate = useNavigate();
    const location = useLocation();
    const student = location.state?.student;

    const { loading, data, startPolling, stopPolling } = useQuery(GET_STUDENT_PROJECTS);
        if (loading || !data) {
            startPolling(500); // making sure data has loaded
            return (
              <Typography>loading</Typography>
            );
          };
        stopPolling();
    var assignedProjects=data.me.user.assignedProjects;
    console.log(assignedProjects)
    var startedProjects = assignedProjects.filter((p: StudentProject)=>p.projectStatus === ProjectStatus.Working);
    var returnedProjects = assignedProjects.filter((p: StudentProject)=>p.projectStatus === ProjectStatus.Returned);
    var acceptedProjects = assignedProjects.filter((p: StudentProject)=>p.projectStatus === ProjectStatus.Accepted); 

    const handleTabChange = (_event: React.SyntheticEvent, newIndex: number) => {
        if (newIndex === 0) {
          navigate('/teacherdashboard/educationpath', { state: { student } });
        } else if (newIndex === 1) {
          navigate('/teacherdashboard/teacherstudies', { state: { student } });
        }else if(newIndex === 2){
          navigate('/teacherdashboard/studentprojects',{state:{student}});
        }
      };

    const tabIndex = location.pathname === '/teacherdashboard/studentprojects' ? 0 : 1;

    return(
      <>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', mx: '10%' }}></Box>
        <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        aria-label="edit studies tabs"
        sx={{
          '& .MuiTab-root': {
            backgroundColor: '#eaddff',
            borderRadius: '10px 10px 0 0',
          },
          '& .Mui-selected': {
            backgroundColor: '#65558f',
            color: '#ffffff !important',
            borderRadius: '10px 10px 0 0',
          },
        }}
      >
        <Tab label="Opinnot" />
        <Tab label="HOKS" />
        <Tab label='Projektit'></Tab>
      </Tabs>
      <Typography variant='h4' align='center' color='black'>{data.me.user.firstName} {data.me.user.lastName}:n Projektit</Typography>
      <Typography variant='h6' align='center' color='black'>Työn ala</Typography>
      <List sx={{ overflow:'auto', position: 'relative' }}>
        {startedProjects.map((project)=>(
          <ListItem key={project.projectId}>
            <EvaluateProject project={project} studentId={data.me.user.id}></EvaluateProject>
          </ListItem>
        ))}
      </List>
      <Typography variant='h6' align='center' color='black'>Palautetut</Typography>
      <List sx={{ overflow:'auto', position: 'relative' }}>
        {returnedProjects.map((project)=>(
          <ListItem key={project.projectId}>
            <EvaluateProject project={project} studentId={data.me.user.id} ></EvaluateProject>
          </ListItem>
        ))}
      </List>
      <Typography variant='h6' align='center' color='black'>Valmiit</Typography>
      <List sx={{ overflow:'auto', position: 'relative' }}>
        {acceptedProjects.map((project)=>(
          <ListItem key={project.projectId}>
            <EvaluateProject project={project} studentId={data.me.user.id}></EvaluateProject>
          </ListItem>
        ))}
      </List>
      </>
    )
}
export default StudentProjectsPath;