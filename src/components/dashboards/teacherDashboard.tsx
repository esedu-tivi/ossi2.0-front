import Navbar from '../Navbar';
import DrawerMenu from '../DrawerMenu'; 
import { Box,Toolbar, CssBaseline} from '@mui/material';
import NotificationsBox from '../NotificationsBox';
import '../../css/teacherDashboard.css';
import StudentList from '../StudentList';

const TeacherDashboard = () => {
  return (
    <Box className="teacher-dashboard">
      <CssBaseline />
      <Navbar />
      <DrawerMenu />
      <Box component="main" className="teacher-main">
        <Toolbar />
        <NotificationsBox />
        <StudentList />
      </Box>
    </Box>
  );
};

export default TeacherDashboard;


