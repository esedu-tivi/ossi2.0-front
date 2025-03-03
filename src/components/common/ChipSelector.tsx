import React, { useRef } from 'react';
import { Box, Chip, FormControl, IconButton, InputLabel } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import buttonStyles from '../../styles/buttonStyles';
import formStyles from '../../styles/formStyles';

interface ChipSelectorProps {
  label: string;
  items: { id: string; name: string; description?: string }[];
  onAdd: () => void;
  onDelete: (index: number) => void;
  currentField: string;
}

const ChipSelector: React.FC<ChipSelectorProps> = ({
  label,
  items,
  onAdd,
  onDelete,
  currentField,
}) => {
  const deleteButtonRef = useRef<HTMLDivElement | null>(null);

  const handleDelete = (index: number) => {
    deleteButtonRef.current?.blur();
    onDelete(index);
  };

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
        {items.map((item, index) => (
          <Chip
            key={item.id}
            label={currentField === 'competenceRequirements' ? item.description : item.name}
            onDelete={() => handleDelete(index)}
            ref={(el) => {
              if (index === items.length - 1) deleteButtonRef.current = el;
            }}
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
