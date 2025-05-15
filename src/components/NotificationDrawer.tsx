import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { GET_NOTIFICATIONS } from '../graphql/GetNotifications';
import { GET_UNREAD_NOTIFICATION_COUNT } from '../graphql/GetUnreadNotificationCount';
import { MARK_NOTIFICATION_AS_READ } from '../graphql/MarkNotificationAsRead';
import {
    Drawer,
    Box,
    List,
    ListItemButton,
    Typography,
    Divider,
} from '@mui/material';
import LaunchIcon from '@mui/icons-material/Launch';
import { Link } from 'react-router-dom';

type Notification = {
  id: string;
  title: string;
  summary: string;
  details: string;
  timestamp: string;
  sender: string;
  hasBeenRead: boolean;
  projectId?: number;
};

type Props = {
    open: boolean;
    onClose: () => void;
};

const NotificationDrawer = ({ open, onClose }: Props) => {
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
      summary: n.updateMessage || 'Projektin palautus on arvioitu.',
      details: n.updateMessage || 'Voit tarkistaa palautetun projektin tiedot projektinäkymästä.',
      timestamp: n.time,
      sender: 'Järjestelmä',
      hasBeenRead: n.hasBeenRead,
      projectId: n.project?.id,
    })) ?? []
  ).sort((a: Notification, b: Notification) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 1200, display: 'flex', height: '100%' }}>
        <Box sx={{ width: 400, flexShrink: 0, borderRight: '1px solid #ddd', overflowY: 'auto' }}>
          <Typography variant="h4" sx={{ p: 2, backgroundColor: '#65558F', color: '#FFFFFF', textAlign: 'center' }}>
            Ilmoitukset
          </Typography>
          <Divider/>
          <List sx={{ p: 0 }}>
            {notifications.map((notif) => (
              <ListItemButton
                key={notif.id}
                onClick={async () => {
                  setSelectedNotification(notif);             
                  const backendNotification = data.notifications.notifications.find((n: any) => n.id === notif.id);
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
                }}
                
                selected={selectedNotification?.id === notif.id}
                sx={{
                  height: 'auto',
                  py: 1.5,
                  alignItems: 'flex-start',
                  borderBottom: '1px solid #eee',
                  pl: 2,
                  borderLeft: selectedNotification?.id === notif.id ? '6px solid #65558F' : '4px solid transparent',
                  backgroundColor: !notif.hasBeenRead ? '#f0f4ff' : 'inherit',
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5 }}>
                    {new Date(notif.timestamp).toLocaleString('fi-FI')}
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    noWrap
                    sx={{
                      fontWeight: !notif.hasBeenRead ? 700 : 500,
                      color: !notif.hasBeenRead ? '#1a237e' : 'inherit',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    {!notif.hasBeenRead && (
                      <Box
                        sx={{
                          border: 'solid',
                          borderWidth: '2px',
                          borderColor: 'black',
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          backgroundColor: 'red',
                          display: 'inline-block',
                        }}
                      />
                    )}
                    {notif.title}
                  </Typography>

                  <Typography
                    variant="body2"
                    noWrap
                    sx={{
                      color: 'text.secondary',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {notif.summary}
                  </Typography>
                </Box>
              </ListItemButton>
            ))}
          </List>
        </Box>

        <Box sx={{ flexGrow: 1, p: 3 }}>
          {selectedNotification ? (
            <>
              <Box sx={{ mb: 2, borderBottom: '1px solid #ddd', pb: 1 }}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                  {new Date(selectedNotification.timestamp).toLocaleString('fi-FI')} — {selectedNotification.sender}
                </Typography>
              </Box>
              <Typography variant="h6">{selectedNotification.title}</Typography>
              <Typography variant="body1" sx={{ mt: 2 }}>
                {selectedNotification.details}
              </Typography>
              <Box
                sx={{
                  mt: 4,
                  p: 2,
                  border: '1px solid #ddd',
                  borderRadius: 2,
                  backgroundColor: '#f9f9f9',
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >               
                <Link
                  // Creates a link on notification to navigate to the corresponding project
                  // /studentprojects/ route does not exist yet
                  to={`/studentprojects/${selectedNotification.projectId}`}
                  onClick={() => console.log('Navigating to project ID:', selectedNotification.projectId)}
                  style={{
                    color: '#65558F',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    fontWeight: 500,
                  }}
                >
                  Avaa projekti <LaunchIcon fontSize="small" sx={{ ml: 0.5 }} />
                </Link>
              </Box>
            </>
          ) : (
            <Typography sx={{ mt: 2 }}>
              Valitse ilmoitus nähdäksesi lisätiedot
            </Typography>
          )}
        </Box>
      </Box>
    </Drawer>
  );
};

export default NotificationDrawer;
