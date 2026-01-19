// Example:

/*
import { useState } from 'react';
import MenuSelector from '../common/MenuSelector';
import { STATUS_OPTIONS } from '../../constants/options';
import { Chip } from '@mui/material';

const [status, setStatus] = useState('in_progress');
const selectedStatus = STATUS_OPTIONS.find((o) => o.id === status);

<MenuSelector
  label="Status"
  options={STATUS_OPTIONS}
  onSelect={(option) => setStatus(option.id)}
  valueDisplay={
    <Chip
      label={selectedStatus?.name}
      sx={{ backgroundColor: selectedStatus?.color, color: '#fff', mr: 1 }}
      size="small"
    />
  }
/>;
*/

import { useState, MouseEvent, ReactNode, CSSProperties } from 'react';
import { Box, Typography, IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

export type MenuOption = {
  id: string;
  name: string;
  icon?: ReactNode;
  color?: string;
  [key: string]: unknown;
};

interface MenuSelectorProps {
  label?: string;
  options?: MenuOption[];
  onSelect?: (option: MenuOption) => void;
  valueDisplay?: ReactNode;
  sx?: CSSProperties;
}

const MenuSelector: React.FC<MenuSelectorProps> = ({ label, options = [], onSelect, valueDisplay, sx = {} }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOptionClick = (option: MenuOption) => {
    if (onSelect) onSelect(option);
    handleMenuClose();
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', ...sx }}>
      {label && (
        <Typography variant="subtitle1" sx={{ mr: 1 }}>
          {label}
        </Typography>
      )}
      {valueDisplay}
      <IconButton size="small" onClick={handleMenuOpen} aria-label="Avaa valikko">
        <MoreVertIcon />
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
        {options.length === 0 && <MenuItem disabled>Ei vaihtoehtoja</MenuItem>}
        {options.map((option) => (
          <MenuItem key={option.id} onClick={() => handleOptionClick(option)}>
            {option.icon && <ListItemIcon>{option.icon}</ListItemIcon>}
            {option.color && (
              <ListItemIcon>
                <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: '50%', background: option.color }} />
              </ListItemIcon>
            )}
            <ListItemText primary={option.name} />
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default MenuSelector;
