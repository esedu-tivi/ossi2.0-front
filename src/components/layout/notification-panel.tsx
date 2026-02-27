import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { GET_NOTIFICATIONS } from '@/graphql/GetNotifications';
import { GET_UNREAD_NOTIFICATION_COUNT } from '@/graphql/GetUnreadNotificationCount';
import { MARK_NOTIFICATION_AS_READ } from '@/graphql/MarkNotificationAsRead';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface Notification {
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
  message?: string;
}

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);

  const { data, refetch } = useQuery(GET_NOTIFICATIONS);
  const { refetch: refetchUnread } = useQuery(GET_UNREAD_NOTIFICATION_COUNT);
  const [markNotificationAsRead] = useMutation(MARK_NOTIFICATION_AS_READ);

  const notifications: Notification[] = (
    data?.notifications?.notifications?.map((n: Record<string, unknown>) => ({
      id: n.id,
      title: n.updateMessage ? 'Projektipäivitys' : 'Projektin palautusilmoitus',
      summary:
        (n.updateMessage as string) ||
        (n.message as string) ||
        'Projektin palautus on arvioitu.',
      details:
        (n.updateMessage as string) ||
        (n.message as string) ||
        'Voit tarkistaa palautetun projektin tiedot projektinäkymästä.',
      timestamp: n.time as string,
      sender: 'Järjestelmä',
      hasBeenRead: n.hasBeenRead as boolean,
      projectId: (n.project as Record<string, unknown>)?.id as number | undefined,
      teacherComment: (n.teacherComment as string) || '',
    })) ?? []
  ).sort(
    (a: Notification, b: Notification) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const handleNotificationClick = async (notif: Notification) => {
    setSelectedNotification(notif);
    const backendNotification = data.notifications.notifications.find(
      (n: Record<string, unknown>) => n.id === notif.id
    );
    if (!backendNotification.hasBeenRead) {
      try {
        await markNotificationAsRead({
          variables: { markNotificationAsReadId2: backendNotification.id },
        });
        await refetch();
        await refetchUnread();
      } catch (err) {
        console.error('Failed to mark as read:', err);
      }
    }
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-4xl p-0"
        showCloseButton
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Ilmoitukset</SheetTitle>
          <SheetDescription>Ilmoituslista</SheetDescription>
        </SheetHeader>
        <div className="flex h-full">
          {/* Notification list */}
          <div className="w-80 shrink-0 border-r overflow-y-auto">
            <div className="bg-primary p-4 text-center">
              <h2 className="text-lg font-semibold text-primary-foreground">
                Ilmoitukset
              </h2>
            </div>
            <div className="divide-y">
              {notifications.map((notif) => (
                <button
                  key={notif.id}
                  type="button"
                  onClick={() => handleNotificationClick(notif)}
                  className={cn(
                    'flex w-full flex-col gap-1 p-3 text-left transition-colors hover:bg-accent',
                    selectedNotification?.id === notif.id &&
                      'border-l-4 border-l-primary bg-accent',
                    !notif.hasBeenRead && 'bg-blue-50 dark:bg-blue-950/20'
                  )}
                >
                  <span className="text-xs text-muted-foreground">
                    {new Date(notif.timestamp).toLocaleString('fi-FI')}
                  </span>
                  <span
                    className={cn(
                      'flex items-center gap-2 truncate text-sm',
                      !notif.hasBeenRead
                        ? 'font-bold text-primary'
                        : 'font-medium'
                    )}
                  >
                    {!notif.hasBeenRead && (
                      <span className="inline-block size-2.5 shrink-0 rounded-full border-2 border-black bg-red-500" />
                    )}
                    {notif.title}
                  </span>
                  <span className="truncate text-sm text-muted-foreground">
                    {notif.summary}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Notification details */}
          <div className="flex-1 overflow-y-auto p-6">
            {selectedNotification ? (
              <>
                <div className="mb-4 border-b pb-2">
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedNotification.timestamp).toLocaleString(
                      'fi-FI'
                    )}{' '}
                    &mdash; {selectedNotification.sender}
                  </p>
                </div>
                <h3 className="text-lg font-semibold">
                  {selectedNotification.title}
                </h3>
                <p className="mt-4 text-sm">{selectedNotification.details}</p>
                {selectedNotification.teacherComment && (
                  <div className="mt-4">
                    <h4 className="text-lg font-semibold">
                      Opettajan kommentti
                    </h4>
                    <p className="mt-1 text-sm">
                      {selectedNotification.teacherComment}
                    </p>
                  </div>
                )}
                <div className="mt-6 inline-flex items-center rounded-md border bg-muted/50 p-3">
                  <Link
                    to={`/studentprojects/${selectedNotification.projectId}`}
                    onClick={onClose}
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary no-underline hover:underline"
                  >
                    Avaa projekti
                    <ExternalLink className="size-4" />
                  </Link>
                </div>
              </>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                Valitse ilmoitus nähdäksesi lisätiedot
              </p>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
