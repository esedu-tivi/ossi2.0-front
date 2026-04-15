import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../utils/auth-context';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import HomeIcon from '@mui/icons-material/Home';
import SchoolIcon from '@mui/icons-material/School';
import FolderIcon from '@mui/icons-material/Folder';
import EventIcon from '@mui/icons-material/Event';
import GradeIcon from '@mui/icons-material/Grade';
import BusinessIcon from '@mui/icons-material/Business';
import UserProfile from './UserProfile';

import '../css/DrawerMenu.css';
import { AppBar, Box } from '@mui/material';

interface DrawerMenuProps {
  mobileOpen: boolean;
  handleDrawerClose: () => void;
  handleDrawerTransitionEnd: () => void;
}

const drawerWidth = 240;

type ActiveMatch = 'exact' | 'prefix' | 'none';

interface MenuItemConfig {
  text: string;
  icon: React.ReactNode;
  route: string;
  activeMatch?: ActiveMatch;
}

const teacherMenu: MenuItemConfig[] = [
  { text: 'Etusivu', icon: <HomeIcon />, route: '/teacherdashboard' },
  { text: 'Opiskelijat', icon: <SchoolIcon />, route: '/teacherdashboard' },
  { text: 'Projektit', icon: <FolderIcon />, route: '/teacherprojects' },
  { text: 'Teemat', icon: <EventIcon />, route: '/qualificationunitparts' },
  { text: 'Tutkinnot', icon: <GradeIcon />, route: '/teacherdashboard' },
];

const studentMenu: MenuItemConfig[] = [
  { text: 'Etusivu', icon: <HomeIcon />, route: '/studentdashboard', activeMatch: 'exact' },
  { text: 'Projektit', icon: <FolderIcon />, route: '/studentdashboard', activeMatch: 'none' },
  { text: 'Tehtävät', icon: <EventIcon />, route: '/studentdashboard', activeMatch: 'none' },
  { text: 'Arvosanat', icon: <GradeIcon />, route: '/studentdashboard', activeMatch: 'none' },
  { text: 'Harjoittelujaksot', icon: <BusinessIcon />, route: '/studentdashboard/harjoittelujaksot', activeMatch: 'prefix' },
];

const DrawerMenu: React.FC<DrawerMenuProps> = ({ mobileOpen, handleDrawerClose, handleDrawerTransitionEnd }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useAuth();

  const menuItems = role === 'teacher' ? teacherMenu : studentMenu;

  const itemIsActive = (item: MenuItemConfig) => {
    const currentPath = location.pathname;
    if (role === 'teacher') return currentPath === item.route;

    const m = item.activeMatch ?? 'none';
    if (m === 'none') return false;
    if (m === 'exact') return currentPath === item.route;
    return currentPath === item.route || currentPath.startsWith(`${item.route}/`);
  };

  const drawer = (
    <div>
      <Divider />
      <UserProfile />
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => {
                navigate(item.route);
              }}
              className={`menu-item ${itemIsActive(item) ? 'active' : ''}`}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div >
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >

      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onTransitionEnd={handleDrawerTransitionEnd}
          onClose={handleDrawerClose}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          slotProps={{
            root: {
              keepMounted: true,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
    </Box>
  )
};

export default DrawerMenu;
