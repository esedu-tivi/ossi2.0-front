import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { useMsal } from '@azure/msal-react';
import { Bell, LogOut, RefreshCw } from 'lucide-react';
import AuthContext, { useAuth } from '@/utils/auth-context';
import { GET_UNREAD_NOTIFICATION_COUNT } from '@/graphql/GetUnreadNotificationCount';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NotificationPanel } from './notification-panel';

function getInitials(email: string | undefined): string {
  if (!email) return '??';
  return email
    .split('@')[0]
    .split('.')
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

export function UserNav() {
  const { instance } = useMsal();
  const { userEmail } = useAuth();
  const { switchRole, role } = useContext(AuthContext);
  const navigate = useNavigate();
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);

  const { data: unreadData } = useQuery(GET_UNREAD_NOTIFICATION_COUNT);
  const unreadCount = unreadData?.unreadNotificationCount?.count || 0;

  const onLogOut = () => {
    sessionStorage.clear();
    instance.logoutRedirect();
  };

  return (
    <div className="flex items-center gap-2">
      {/* Notification bell */}
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setNotificationPanelOpen(true)}
        aria-label="Ilmoitukset"
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 flex size-5 items-center justify-center p-0 text-[10px]"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>

      <NotificationPanel
        open={notificationPanelOpen}
        onClose={() => setNotificationPanelOpen(false)}
      />

      {/* User avatar with dropdown */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="relative inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Avatar>
              <AvatarFallback>{getInitials(userEmail)}</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="bottom" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{userEmail}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {role === 'teacher' ? 'Opettaja' : 'Opiskelija'}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              const newRole = role === 'student' ? 'teacher' : 'student';
              switchRole(newRole);
              navigate(newRole === 'teacher' ? '/teacherdashboard' : '/studentdashboard');
            }}
          >
            <RefreshCw className="mr-2 size-4" />
            Vaihda roolia
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onLogOut}>
            <LogOut className="mr-2 size-4" />
            Kirjaudu ulos
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
