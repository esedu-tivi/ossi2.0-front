// Shows user profile info

import { useContext, useState } from 'react';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MailIcon from '@mui/icons-material/Mail';
import EngineeringIcon from '@mui/icons-material/Engineering';
import Snackbar from '@mui/material/Snackbar';
import AuthContext, { useAuth } from '../utils/auth-context';
import '../css/UserProfile.css';
import NotificationDrawer from './NotificationDrawer';
import { GET_UNREAD_NOTIFICATION_COUNT } from '../graphql/GetUnreadNotificationCount';
import { useQuery } from '@apollo/client';
import { Tooltip } from '@mui/material';


const devEnv = import.meta.env.DEV;

const UserProfile = () => {
    const { userEmail } = useAuth();
    const { setRole, role } = useContext(AuthContext)
    const [showMessage, setShowMessage] = useState(false);
    const [messageContent, setMessageContent] = useState('');
    const [drawerOpen, setDrawerOpen] = useState(false);

    const { data: unreadData } = useQuery(GET_UNREAD_NOTIFICATION_COUNT);

    const handleBadgeClick = (badgeType: string) => {
        setMessageContent(`Ei vielä mitään nähtävää (${badgeType})`);
        setShowMessage(true);
    };

    const handleClose = () => {
        setShowMessage(false);
    };

    return (
        <Box className="user-profile">
            <Avatar className="user-avatar">
                {userEmail
                    ?.split('@')[0]
                    .split('.')
                    .map((namePart) => namePart.charAt(0).toUpperCase())
                    .join('')}
            </Avatar>
            <Typography className="user-email">{userEmail}</Typography>
            <Box className="user-icons">
                <IconButton className="user-icon-button" aria-label="notifications" onClick={() => setDrawerOpen(true)}>
                    <Badge badgeContent={unreadData?.unreadNotificationCount?.count || 0} color="error">
                        <NotificationsIcon />
                    </Badge>
                </IconButton>
                <NotificationDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
                <IconButton className="user-icon-button" aria-label="messages" onClick={() => handleBadgeClick('Viestit')}>
                    <Badge badgeContent={1} color="error">
                        <MailIcon />
                    </Badge>
                </IconButton>

                {devEnv && (
                    <Tooltip title="Vaihda roolia">
                        <IconButton className="user-icon-button" aria-label="role" onClick={() => setRole(role === 'student' ? 'teacher' : 'student')}>
                            <EngineeringIcon />
                        </IconButton>
                    </Tooltip>
                )}
            </Box>
            <Snackbar open={showMessage} autoHideDuration={3000} onClose={handleClose} message={messageContent} />
        </Box>
    );
};

export default UserProfile;
