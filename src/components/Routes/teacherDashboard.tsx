import { Box, CssBaseline } from '@mui/material';
import NotificationsBox from '../NotificationsBox';
import '../../css/teacherDashboard.css';
import StudentList from '../StudentList';
// For testing, show followed students list
import FollowedStudentsList from '../FollowedStudentsList';

const TeacherDashboard = () => {
  return (
    <Box className="teacher-dashboard">
      <CssBaseline />
      <Box component="main" className="teacher-main">
        <NotificationsBox />
        <StudentList />
        <FollowedStudentsList />
      </Box>
    </Box>
  );
};

export default TeacherDashboard;



