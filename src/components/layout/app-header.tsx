import { useLocation } from 'react-router-dom';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';

const routeTitles: Record<string, string> = {
  '/teacherdashboard': 'Etusivu',
  '/studentdashboard': 'Etusivu',
  '/teacherprojects': 'Projektit',
  '/qualificationunitparts': 'Teemat',
  '/workplaces': 'Työpaikat',
};

function getPageTitle(pathname: string): string {
  if (routeTitles[pathname]) {
    return routeTitles[pathname];
  }
  // Handle dynamic routes
  if (pathname.startsWith('/project/')) return 'Projektin tiedot';
  if (pathname.startsWith('/workplace/')) return 'Työpaikan tiedot';
  if (pathname.startsWith('/studentprojects/')) return 'Projektin tiedot';
  if (pathname.startsWith('/student/')) return 'Opiskelijan tiedot';
  return 'Ossi 2.0';
}

export function AppHeader() {
  const location = useLocation();
  const title = getPageTitle(location.pathname);

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 !h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>{title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
}
