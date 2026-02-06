import { Avatar, AvatarFallback, AvatarImage, } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar, } from "@/components/ui/sidebar"
import { EllipsisVertical, LogOut, User, UserRoundCog } from "lucide-react"

import { useAuth } from "@/utils/auth-context"

interface NavUserProps {
  user: {
    firstName: string
    lastName: string
    email: string
    avatar: string
    fullName?: string
  }
}

const devEnv = import.meta.env.DEV;

export function NavUser({ user }: NavUserProps) {
  const { isMobile } = useSidebar()
  const { setRole, role, logOut } = useAuth()

  const fullName = [user.firstName, user.lastName].join(' ')
  const initials = [user.firstName, user.lastName].map(n => n[0]).join('').toUpperCase()

  const switchRole = () => setRole(role === 'student' ? 'teacher' : 'student')

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>

            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar>
                <AvatarImage src={user.avatar} alt={fullName} />
                <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{fullName}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {user.email}
                </span>
              </div>
              <EllipsisVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={fullName} />
                  <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{fullName}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => switchRole()}>
                <User />
                Profiili
              </DropdownMenuItem>
              {devEnv && (
                <DropdownMenuItem onClick={() => switchRole()}>
                  <UserRoundCog />
                  Vaihda Roolia
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logOut()}>
              <LogOut />
              Kirjaudu ulos
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu >
  )
}
