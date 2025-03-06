import React from 'react';
import { Box, Chip, FormControl, IconButton, InputLabel } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import buttonStyles from '../../styles/buttonStyles';
import formStyles from '../../styles/formStyles';

interface ChipSelectorProps {
  label: string;
  items: { id: string; name: string; description?: string }[]; // These are the selected items
  onAdd: () => void; // Opens the modal for adding items
  currentField: string;
}

const ChipSelector: React.FC<ChipSelectorProps> = ({
  label,
  items,
  onAdd,
  currentField,
}) => {

  return (
    <FormControl fullWidth>
      <InputLabel
        sx={{
          display: 'flex',
          position: 'relative',
          paddingBottom: 3,
        }}
      >
        {label}
      </InputLabel>
      <Box sx={formStyles.formModalInputBox}>
        {items.map((item) => (
          <Chip
            key={item.id}
            label={currentField === 'competenceRequirements' ? item.description : item.name}
            sx={{ backgroundColor: '#E0E0E0' }}
          />
        ))}
        <IconButton
          onClick={onAdd}
          color="primary"
          sx={buttonStyles.openModalButton}
        >
          <AddIcon />
        </IconButton>
      </Box>
    </FormControl>
  );
};

export default ChipSelector;
