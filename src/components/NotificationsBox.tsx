import React from 'react';
import { Paper, Typography } from '@mui/material';
import '../css/NotificationsBox.css';

const NotificationsBox: React.FC = () => {
  return (
    <Paper className="notifications-box" elevation={3}>
      <Typography className="notifications-title" gutterBottom>
        Tässä voi olla esimerkiksi ilmoitus palautetusta projektista, inaktiivisessta käyttäjätilistä tai muusta vastaavasta.
      </Typography>
    </Paper>
  );
};

export default NotificationsBox;

