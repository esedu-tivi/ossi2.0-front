import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    List,
    ListItem,
    ListItemText,
    Checkbox,
    TextField,
    InputAdornment,
    Box,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { useMutation } from '@apollo/client';
import { CREATE_PROJECT_TAG } from '../graphql/CreateProjectTag';

interface Item {
    id: string;
    name: string;
}

interface SelectorProps {
    items: Item[];
    title: string;
    open: boolean;
    buttonText: string;
    selectedItems: Item[];
    onAdd: (selectedItems: Item[]) => void;
    onClose: () => void;
    currentField: string;
    updateProjectTags: (newTag: Item) => void;
}

const Selector: React.FC<SelectorProps> = ({
    items,
    title,
    buttonText,
    open,
    selectedItems: initialSelectedItems,
    onAdd,
    onClose,
    currentField,
    updateProjectTags,
}) => {
    const [selectedItems, setSelectedItems] = useState<Item[]>(initialSelectedItems);
    const [searchTerm, setSearchTerm] = useState('');
    const [createProjectTag] = useMutation(CREATE_PROJECT_TAG);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        if (open) {
            setSelectedItems(initialSelectedItems);
            setSearchTerm('');
        }
    }, [open, initialSelectedItems]);

    const handleToggle = (value: Item) => () => {
        const currentIndex = selectedItems.findIndex((item) => item.id === value.id);
        const newChecked = [...selectedItems];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        setSelectedItems(newChecked);
    };

    const handleAdd = () => {
        console.log('selectedItems', selectedItems);
        onAdd(selectedItems);
        onClose();
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleAddNewItem = async () => {
        if (searchTerm && !items.some((item) => item.name === searchTerm)) {
            try {
                const { data } = await createProjectTag({
                    variables: { name: searchTerm },
                });
                const newTag = { id: data.createProjectTag.id, name: data.createProjectTag.name };
                setSearchTerm('');
                updateProjectTags(newTag); // Päivitä tunnisteet lista
            } catch (error) {
                console.error('Error creating new tag:', error);
            }
        }
    };

    const filteredItems = items.filter((item) => item && item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <Dialog open={open} onClose={onClose} fullScreen={isMobile}>
            <DialogTitle sx={{ backgroundColor: '#65558f', color: '#ffffff' }}>
                {title}
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: 'white',
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ width: isMobile ? '100%' : 500, padding: 0 }}>
                <Box sx={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: '#fff', padding: 0 }}>
                    <TextField
                        variant="outlined"
                        placeholder={currentField === 'tags' ? 'Hae tai lisää uusi tunniste' : 'Hae'}
                        fullWidth
                        value={searchTerm}
                        onChange={handleSearchChange}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    {currentField === 'tags' && (
                                        <IconButton onClick={handleAddNewItem}>
                                            <AddIcon />
                                        </IconButton>
                                    )}
                                    <IconButton>
                                        <SearchIcon />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        sx={{ backgroundColor: '#ece6f0' }}
                    />
                    {selectedItems.length > 0 && (
                        <Box sx={{ padding: 1, backgroundColor: '#ece6f0', display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            <Typography variant="caption">Valitut:</Typography>
                            {selectedItems.map((item) => (
                                <Typography key={item.id} variant="caption" sx={{ marginRight: 1 }}>
                                    {item.name}
                                </Typography>
                            ))}
                        </Box>
                    )}
                </Box>
                <List>
                    {filteredItems.map((item) => (
                        <ListItem
                            sx={{ borderBottom: 1, borderColor: '#ddd', paddingTop: 0, paddingBottom: 0, display: 'flex', justifyContent: 'space-between' }}
                            key={item.id}
                            onClick={handleToggle(item)}
                        >
                            <ListItemText primary={item.name} />
                            <Checkbox
                                sx={{
                                    marginLeft: 'auto',
                                    color: '#65558f',
                                    '&.Mui-checked': {
                                        color: '#65558f',
                                    },
                                }}
                                checked={selectedItems.some((selectedItem) => selectedItem.id === item.id)}
                            />
                        </ListItem>
                    ))}
                </List>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center' }}>
                <Button onClick={handleAdd} sx={{ backgroundColor: '#65558f', color: '#ffffff', borderRadius: 25 }}>
                    {buttonText}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default Selector;
