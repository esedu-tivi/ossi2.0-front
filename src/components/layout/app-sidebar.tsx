import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/utils/auth-context';
import {
  Home,
  GraduationCap,
  FolderOpen,
  Layers,
  Building2,
  Award,
  ClipboardList,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { UserNav } from './user-nav';

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  route: string;
  activeMatch?: 'exact' | 'prefix' | 'none';
}

const teacherMenu: MenuItem[] = [
  { text: 'Etusivu', icon: <Home className="size-4" />, route: '/teacherdashboard' },
  { text: 'Opiskelijat', icon: <GraduationCap className="size-4" />, route: '/teacherdashboard' },
  { text: 'Projektit', icon: <FolderOpen className="size-4" />, route: '/teacherprojects' },
  { text: 'Teemat', icon: <Layers className="size-4" />, route: '/qualificationunitparts' },
  { text: 'Työpaikat', icon: <Building2 className="size-4" />, route: '/workplaces' },
  { text: 'Tutkinnot', icon: <Award className="size-4" />, route: '/teacherdashboard' },
];

const studentMenu: MenuItem[] = [
  { text: 'Etusivu', icon: <Home className="size-4" />, route: '/studentdashboard', activeMatch: 'exact' },
  { text: 'Projektit', icon: <FolderOpen className="size-4" />, route: '/studentdashboard', activeMatch: 'none' },
  { text: 'Tehtävät', icon: <ClipboardList className="size-4" />, route: '/studentdashboard', activeMatch: 'none' },
  { text: 'Arvosanat', icon: <Award className="size-4" />, route: '/studentdashboard', activeMatch: 'none' },
  { text: 'Harjoittelujaksot', icon: <Building2 className="size-4" />, route: '/studentdashboard/harjoittelujaksot', activeMatch: 'prefix' },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useAuth();

  const menuItems = role === 'teacher' ? teacherMenu : studentMenu;
  const itemIsActive = (item: MenuItem) => {
    if (role === 'teacher') return location.pathname === item.route;

    const match = item.activeMatch ?? 'none';
    if (match === 'none') return false;
    if (match === 'exact') return location.pathname === item.route;
    return location.pathname === item.route || location.pathname.startsWith(`${item.route}/`);
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <UserNav />
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.text}>
                  <SidebarMenuButton
                    isActive={itemIsActive(item)}
                    tooltip={item.text}
                    onClick={() => navigate(item.route)}
                  >
                    {item.icon}
                    <span>{item.text}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
