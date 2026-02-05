import React, { useState } from 'react';
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import InfoIcon from '@mui/icons-material/Info';
import EditIcon from '@mui/icons-material/Edit';
import ArchiveIcon from '@mui/icons-material/Archive';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import ListAltIcon from '@mui/icons-material/ListAlt';

interface TeacherStudentMenuProps {
  isFollowed: boolean;
  isNotified: boolean;
  onFollowToggle: () => void;
  onNotifyToggle: () => void;
  onEdit: () => void;
  onArchive: () => void;
  onProfile: () => void;
}

const TeacherStudentMenu: React.FC<TeacherStudentMenuProps> = ({
  isFollowed,
  isNotified,
  onFollowToggle,
  onNotifyToggle,
  onEdit,
  onArchive,
  onProfile
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton
        onClick={e => setAnchorEl(e.currentTarget)}
        aria-label="Avaa valikko"
        sx={{ transition: 'background 0.2s', '&:hover': { background: '#e3e3e3' } }}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { minWidth: 200, borderRadius: 2, boxShadow: 3, p: 0.5 } } }}
      >
        <MenuItem onClick={() => { onProfile(); setAnchorEl(null); }}>
          <ListItemIcon><InfoIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Siirry profiiliin" />
        </MenuItem>
        <MenuItem onClick={() => { onEdit(); setAnchorEl(null); }}>
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Muokkaa" />
        </MenuItem>
        <MenuItem onClick={() => { onArchive(); setAnchorEl(null); }}>
          <ListItemIcon><ArchiveIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Arkistoi" />
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={() => { onFollowToggle(); setAnchorEl(null); }}>
          <ListItemIcon>{isFollowed ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}</ListItemIcon>
          <ListItemText primary={isFollowed ? 'Poista seurannasta' : 'Seuraa'} />
        </MenuItem>
        <MenuItem onClick={() => { onNotifyToggle(); setAnchorEl(null); }}>
          <ListItemIcon>{isNotified ? <NotificationsOffIcon fontSize="small" /> : <NotificationsActiveIcon fontSize="small" />}</ListItemIcon>
          <ListItemText primary={isNotified ? 'Poista ilmoitukset käytöstä' : 'Ota ilmoitukset käyttöön'} />
        </MenuItem>
        <MenuItem disabled>
          <ListItemIcon><ListAltIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Lisää haluttu toiminto" />
        </MenuItem>
      </Menu>
    </>
  );
};

export default TeacherStudentMenu;
