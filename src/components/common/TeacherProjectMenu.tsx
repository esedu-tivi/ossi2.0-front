import React, { useState } from 'react';
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ListAltIcon from '@mui/icons-material/ListAlt';

interface TeacherProjectMenuProps {
  isFollowed: boolean;
  onFollowToggle: () => void;
  onEdit: () => void;
  onTagStudent: () => void;
}

const TeacherProjectMenu: React.FC<TeacherProjectMenuProps> = ({ isFollowed, onFollowToggle, onEdit, onTagStudent }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton
        onClick={e => setAnchorEl(e.currentTarget)}
        aria-label="Avaa valikko"
        sx={{
          transition: 'background 0.2s',
          '&:hover': { background: '#e3e3e3' }
        }}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { minWidth: 180, borderRadius: 2, boxShadow: 3, p: 0.5 } } }}
      >
        <MenuItem onClick={() => { onEdit(); setAnchorEl(null); }}>
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Muokkaa" />
        </MenuItem>
        <MenuItem onClick={() => { onFollowToggle(); setAnchorEl(null); }}>
          <ListItemIcon>{isFollowed ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}</ListItemIcon>
          <ListItemText primary={isFollowed ? 'Poista seurannasta' : 'Seuraa'} />
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={() => { onTagStudent(); setAnchorEl(null); }}>
          <ListItemIcon><PersonAddIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Tägää opiskelija" />
        </MenuItem>
        <MenuItem disabled>
          <ListItemIcon><ListAltIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Lisää haluttu toiminto" />
        </MenuItem>
      </Menu>
    </>
  );
};

export default TeacherProjectMenu;
