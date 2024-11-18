import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, List, ListItem, ListItemText, Checkbox, TextField, InputAdornment } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';

interface SelectorProps {
    items: string[];
    title: string;
    openWindow: boolean;
    buttonText: string;
    onAdd: (selectedItems: string[]) => void;
}

const Selector: React.FC<SelectorProps> = ({ items, title, buttonText, openWindow, onAdd }) => {
    const [open, setOpen] = useState(openWindow);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const handleToggle = (value: string) => () => {
        const currentIndex = selectedItems.indexOf(value);
        const newChecked = [...selectedItems];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        setSelectedItems(newChecked);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleAdd = () => {
        onAdd(selectedItems);
        setOpen(false);
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const filteredItems = items.filter((item) => item.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle sx={{ backgroundColor: '#65558f', color: '#ffffff' }} className="dialogTitle">
                    {title}
                </DialogTitle>
                <IconButton
                    aria-label="close"
                    onClick={handleClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: 'white',
                    }}
                >
                    <CloseIcon />
                </IconButton>
                <DialogContent sx={{ width: 500, padding: 0 }}>
                    <TextField
                        variant="outlined"
                        placeholder="Hae"
                        fullWidth
                        value={searchTerm}
                        onChange={handleSearchChange}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton>
                                        <SearchIcon />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        sx={{ marginBottom: 2, backgroundColor: '#ece6f0' }}
                    />
                    <List>
                        {filteredItems.map((item) => (
                            <ListItem
                                sx={{ borderBottom: 1, borderColor: '#ddd', display: 'flex', justifyContent: 'space-between' }}
                                key={item}
                                onClick={handleToggle(item)}
                            >
                                <ListItemText primary={item} />
                                <Checkbox sx={{ marginLeft: 'auto' }} checked={selectedItems.indexOf(item) !== -1} />
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
        </div>
    );
};

export default Selector;
