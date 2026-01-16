// Shows user profile info

import { useContext, useState } from 'react';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MailIcon from '@mui/icons-material/Mail';
import Snackbar from '@mui/material/Snackbar';
import AuthContext, { useAuth } from '../utils/auth-context';
import '../css/UserProfile.css';
import NotificationDrawer from './NotificationDrawer';
import { GET_UNREAD_NOTIFICATION_COUNT } from '../graphql/GetUnreadNotificationCount';
import { useQuery } from '@apollo/client';

import { ButtonBase, Menu, MenuItem, Tooltip } from '@mui/material';
import { useMsal } from '@azure/msal-react';
import { useNavigate } from 'react-router-dom';


const devEnv = import.meta.env.DEV;

const UserProfile = () => {
    const { instance } = useMsal();
    const { userEmail } = useAuth();
    const { setRole, role } = useContext(AuthContext)
    const navigate = useNavigate();
    const [showMessage, setShowMessage] = useState(false);
    const [messageContent, setMessageContent] = useState('');
    const [drawerOpen, setDrawerOpen] = useState(false);

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const { data: unreadData } = useQuery(GET_UNREAD_NOTIFICATION_COUNT);

    const handleBadgeClick = (badgeType: string) => {
        setMessageContent(`Ei vielä mitään nähtävää (${badgeType})`);
        setShowMessage(true);
    };

    const onLogOut = () => {
        sessionStorage.clear()
        instance.logoutRedirect()
    }

    const handleClose = () => {
        setShowMessage(false);
    };

    return (
        <Box className="user-profile">
            <ButtonBase
                component="label"
                role={undefined}
                onClick={(event) => setAnchorEl(event.currentTarget)}
                aria-label="Avatar image"
                sx={{
                    borderRadius: '40px',
                    '&:focus-visible': {
                        outline: '2px solid',
                        outlineOffset: '2px',
                    },
                }}
            >
                <Avatar
                    className="user-avatar"
                    aria-label="Avatar image"
                    color="inherit" >
                    {userEmail
                        ?.split('@')[0]
                        .split('.')
                        .map((namePart) => namePart.charAt(0).toUpperCase())
                        .join('')}
                </Avatar>
            </ButtonBase>
            <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}

                open={open}
                onClose={() => setAnchorEl(null)}
            >
                {devEnv && (
                    <MenuItem aria-label="role" onClick={() => setRole(role === 'student' ? 'teacher' : 'student')} > Vaihda roolia </MenuItem>
                )}
                                {role === 'teacher' && (
                                    <MenuItem
                                        aria-label="profile-settings"
                                        onClick={() => {
                                            setAnchorEl(null);
                                            navigate('/teacherdashboard/profilesettings');
                                        }}
                                    >
                                        Profiiliasetukset
                                    </MenuItem>
                                )}
                <MenuItem aria-label="logout" onClick={() => onLogOut()} > Kirjaudu ulos</MenuItem>
            </Menu>
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

            </Box>
            <Snackbar open={showMessage} autoHideDuration={3000} onClose={handleClose} message={messageContent} />
        </Box >
    );
};

export default UserProfile;
