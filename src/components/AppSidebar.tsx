import {
  Briefcase,
  CalendarRange,
  Calendars,
  ChartNoAxesColumnIncreasing,
  GraduationCap,
  Home,
  Notebook,
  Star,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/utils/auth-context";
import UserProfile from "./UserProfile";

const teacherMenu = [
  { title: "Etusivu", icon: Home, route: "/teacherdashboard" },
  { title: "Opiskelijat", icon: GraduationCap, route: "/teacherdashboard" },
  { title: "Projektit", icon: Notebook, route: "/teacherprojects" },
  { title: "Teemat", icon: Calendars, route: "/qualificationunitparts" },
  { title: "Työpaikat", icon: Briefcase, route: "/workplaces" },
  { title: "Tutkinnot", icon: Star, route: "#" },
];

const studentMenu = [
  { title: "Etusivu", icon: Home, route: "/studentdashboard" },
  { title: "Projektit", icon: Notebook, route: "#" },
  { title: "Tehtävät", icon: CalendarRange, route: "#" },
  { title: "Arvosanat", icon: ChartNoAxesColumnIncreasing, route: "#" },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const { role } = useAuth();
  const menuItems = role === "teacher" ? teacherMenu : studentMenu;

  return (
    <Sidebar>
      <SidebarHeader>
        <UserProfile />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup />
        <SidebarGroupLabel>Label</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === item.route}
                >
                  <Link
                    to={item.route}
                    onClick={() => {
                      navigate(item.route);
                    }}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
