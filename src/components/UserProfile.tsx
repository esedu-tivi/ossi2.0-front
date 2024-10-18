//Drawerin päällä oleva käyttäjän profiilin tiedot näyttävä komponentti

import { useState } from 'react';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MailIcon from '@mui/icons-material/Mail';
import Snackbar from '@mui/material/Snackbar';
import { useAuth } from '../utils/auth-context';
import '../Css/UserProfile.css';

const UserProfile = () => {
  const { userEmail } = useAuth(); 
  const [showMessage, setShowMessage] = useState(false);
  const [messageContent, setMessageContent] = useState('');

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
      <Typography className="user-email">
        {userEmail}
      </Typography>
      <Box className="user-icons">
        <IconButton
          className="user-icon-button"
          aria-label="notifications"
          onClick={() => handleBadgeClick('Ilmoitukset')}
        >
          <Badge badgeContent={1} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <IconButton
          className="user-icon-button"
          aria-label="messages"
          onClick={() => handleBadgeClick('Viestit')}
        >
          <Badge badgeContent={1} color="error">
            <MailIcon />
          </Badge>
        </IconButton>
      </Box>
      <Snackbar
        open={showMessage}
        autoHideDuration={3000}
        onClose={handleClose}
        message={messageContent}
      />
    </Box>
  );
};

export default UserProfile;

