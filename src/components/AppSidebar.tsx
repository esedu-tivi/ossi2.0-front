import {
  Bell,
  Briefcase,
  CalendarRange,
  Calendars,
  ChartNoAxesColumnIncreasing,
  GraduationCap,
  Home,
  Mail,
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
import { NavUser } from "./NavUser";
import { useQuery } from "@apollo/client";
import { GET_ME } from "@/graphql/GetMe";
import { QueryResult } from "./QueryResult";
import NotificationDrawer from "./NotificationDrawer";
import { toast } from "sonner";
import { useState } from "react";
import { GET_UNREAD_NOTIFICATION_COUNT } from "@/graphql/GetUnreadNotificationCount";
import { Badge } from "./ui/badge";

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

  const { data: unreadData } = useQuery(GET_UNREAD_NOTIFICATION_COUNT);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { role } = useAuth();
  const menuItems = role === "teacher" ? teacherMenu : studentMenu;
  const { data, loading, error } = useQuery(GET_ME)

  const unreadNotifications = unreadData?.unreadNotificationCount?.count || 0

  return (
    <Sidebar>
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenuButton onClick={() => toast('Ei vielä mitään nähtävää', { position: "top-center" })} >
              <Mail />
              Viestit
            </SidebarMenuButton>
            <SidebarMenuButton onClick={() => setDrawerOpen(true)}>
              <Bell />
              Ilmoitukset
              {unreadNotifications > 0 &&
                <Badge>{unreadNotifications}</Badge>
              }
            </SidebarMenuButton>
            <NotificationDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>
            Label
          </SidebarGroupLabel>
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
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <QueryResult data={data} loading={loading} error={error}>
          <NavUser user={{ ...data?.me.user, avatar: "" }} />
        </QueryResult>
      </SidebarFooter >
    </Sidebar >
  );
}
