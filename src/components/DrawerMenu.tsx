import { useNavigate } from 'react-router-dom';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
// import Toolbar from '@mui/material/Toolbar';
import HomeIcon from '@mui/icons-material/Home';
import SchoolIcon from '@mui/icons-material/School';
import FolderIcon from '@mui/icons-material/Folder';
import EventIcon from '@mui/icons-material/Event';
import WorkIcon from '@mui/icons-material/Work';
import GradeIcon from '@mui/icons-material/Grade';
import UserProfile from './UserProfile';

const drawerWidth = 240;

const DrawerMenu = () => {
  const navigate = useNavigate();
  const menuItems = [
    { text: 'Etusivu', icon: <HomeIcon />, route: '/' },
    { text: 'Opiskelijat', icon: <SchoolIcon />, route: '/students' },
    { text: 'Projektit', icon: <FolderIcon />, route: '/teacherprojects' },
    { text: 'Teemapäivät', icon: <EventIcon />, route: '/theme-days' },
    { text: 'Työpaikat', icon: <WorkIcon />, route: '/jobs' },
    { text: 'Tutkinnot', icon: <GradeIcon />, route: '/degrees' },
  ];

  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          overflow: 'auto',
        },
      }}
      variant="permanent"
      anchor="left"
    >
      {/* <Toolbar /> */}
      <UserProfile /> {/* Place UserProfile back here */}
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton onClick={() => navigate(item.route)}>
              <ListItemIcon sx={{ color: 'black' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} sx={{ color: 'black' }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default DrawerMenu;

