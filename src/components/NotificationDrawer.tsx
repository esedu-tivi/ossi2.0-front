import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { PropsWithChildren, useState } from "react"
import { GET_NOTIFICATIONS } from "@/graphql/GetNotifications";
import { GET_UNREAD_NOTIFICATION_COUNT } from "@/graphql/GetUnreadNotificationCount";
import { MARK_NOTIFICATION_AS_READ } from "@/graphql/MarkNotificationAsRead";
import { useQuery, useMutation } from "@apollo/client";
import { Item, ItemContent, ItemDescription, ItemGroup, ItemHeader, ItemTitle } from "./ui/item";
import { ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@mui/material";

type Notification = {
  id: string;
  title: string;
  summary: string;
  details: string;
  timestamp: string;
  sender: string;
  hasBeenRead: boolean;
  projectId?: number;
  teacherComment?: string;
  status?: 'ACCEPTED' | 'REJECTED';
  message?: string
};



type DateStyle = Intl.DateTimeFormatOptions['dateStyle'];

export const NotificationDrawer: React.FC<PropsWithChildren> = ({ children }) => {
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  const { data, refetch } = useQuery(GET_NOTIFICATIONS);
  const { refetch: refetchUnread } = useQuery(GET_UNREAD_NOTIFICATION_COUNT);
  const [markNotificationAsRead] = useMutation(MARK_NOTIFICATION_AS_READ);

  const notifications: Notification[] = (
    data?.notifications?.notifications?.map((n: any) => ({
      id: n.id,
      title: n.updateMessage
        ? 'Projektipäivitys'
        : 'Projektin palautusilmoitus',
      summary: n.updateMessage || n.message || 'Projektin palautus on arvioitu.',
      details: n.updateMessage || n.message || 'Voit tarkistaa palautetun projektin tiedot projektinäkymästä.',
      timestamp: n.time,
      sender: 'Järjestelmä',
      hasBeenRead: n.hasBeenRead,
      projectId: n.project?.id,
      teacherComment: n.teacherComment || ''
    })) ?? []
  ).sort((a: Notification, b: Notification) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const formatDate = (string: string, style: DateStyle) => new Date(string).toLocaleString('fi-FI', { dateStyle: style, timeStyle: style })

  const onNotificationClick = async (notification: Notification) => {
    const backendNotification = data.notifications.notifications.find((n: any) => n.id === notification.id);
    setSelectedNotification(notification);
    if (!backendNotification.hasBeenRead) {
      try {
        await markNotificationAsRead({
          variables: { markNotificationAsReadId2: backendNotification.id },
        });
        await refetch(); // Refresh the notifications list
        await refetchUnread(); // Refresh the unread count
      } catch (err) {
        console.error('Failed to mark as read:', err);
      }
    }
  }

  const itemStyle = (n: Notification): string => {
    return selectedNotification?.id === n.id ? 'bg-indigo-200 hover:bg-indigo-300!'
      : n.hasBeenRead ? 'bg-accent'
        : ''
  }

  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        {children}
      </DrawerTrigger>
      <DrawerContent className="flex flex-row max-w-3/5! px-2">
        <div className="border-r">
          <DrawerHeader>
            <DrawerTitle className="text-xl">Ilmoitukset</DrawerTitle>
          </DrawerHeader>
          <ItemGroup className="no-scrollbar overflow-y-auto">
            {notifications.map((notification) => (
              <Item key={notification.id} className={itemStyle(notification)} variant="outline" asChild role="listitem">
                <a onClick={() => onNotificationClick(notification)}>
                  <ItemContent>
                    <ItemHeader className="text-muted-foreground font-light">
                      {formatDate(notification.timestamp, "short")}
                    </ItemHeader >
                    <ItemTitle className={(!notification.hasBeenRead ? "underline" : "font-normal")}>
                      {notification.title}
                    </ItemTitle>
                    <ItemDescription>
                      {notification.summary}
                    </ItemDescription>
                  </ItemContent>
                </a>
              </Item>
            ))}
          </ItemGroup>
        </div>

        {selectedNotification && (
          <div className="grow p-4">
            <h4 className="border-b mb-2 text-muted-foreground font-light">
              {formatDate(selectedNotification.timestamp, "medium")} — {selectedNotification.sender}
            </h4>
            <h2 className="text-2xl font-medium">{selectedNotification?.title}</h2>
            <p className="font-normal mt-2">{selectedNotification?.details}</p>
            {selectedNotification.teacherComment && (
              <>
                <h6 className="font-bold text-sm">Opettajan kommentti</h6>
                <p>{selectedNotification.teacherComment}</p>
              </>
            )}
            <Button variant="outlined">
              <Link
                // Creates a link on notification to navigate to the corresponding project
                // /studentprojects/ route does not exist yet
                to={`/studentprojects/${selectedNotification.projectId}`}
                onClick={() => console.log('Navigating to project ID:', selectedNotification.projectId)}
                className="inline-flex"
              >
                Avaa projekti < ExternalLink />
              </Link>
            </Button>
          </div>
        )}
      </DrawerContent>
    </Drawer >
  )
}

