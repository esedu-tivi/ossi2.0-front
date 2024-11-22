import { Box, CssBaseline } from '@mui/material';
import NotificationsBox from '../NotificationsBox';
import '../../css/teacherDashboard.css';
import StudentList from '../StudentList';

const TeacherDashboard = () => {
  return (
    <Box className="teacher-dashboard">
      <CssBaseline />
      <Box component="main" className="teacher-main">
        <NotificationsBox />
        <StudentList />
      </Box>
    </Box>
  );
};

export default TeacherDashboard;



