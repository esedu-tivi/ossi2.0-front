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
import { useMutation, useLazyQuery } from '@apollo/client';
import { CREATE_PROJECT_TAG } from '../graphql/CreateProjectTag';
import { GET_COMPETENCE_REQUIREMENTS } from '../graphql/GetCompetenceRequirements';

// Define the Item interface
export interface Item {
    id: string;
    name: string;
    description?: string;
}

// Define the structure of CompetenceRequirementGroup
interface CompetenceRequirementGroup {
    id: string;
    requirements: CompetenceRequirement[];
}

// Define the structure of CompetenceRequirement
interface CompetenceRequirement {
    id: string;
    description: string;
}

// Define the props for the Selector component
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

// Selector component
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
    // State for selected items and search term
    const [selectedItems, setSelectedItems] = useState<Item[]>(Array.isArray(initialSelectedItems) ? initialSelectedItems : []);
    const [searchTerm, setSearchTerm] = useState('');
    const [createProjectTag] = useMutation(CREATE_PROJECT_TAG);
    const [fetchCompetenceRequirements] = useLazyQuery(GET_COMPETENCE_REQUIREMENTS);
    const [competenceOptions, setCompetenceOptions] = useState<Item[]>([]);
    const [fetchedTeemaIds, setFetchedTeemaIds] = useState<Set<string>>(new Set());

    // Get the theme and check if the screen size is mobile
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Effect to reset selected items and search term when the dialog opens
    useEffect(() => {
        if (open) {
            console.log(`Opening modal for ${currentField}, resetting selected items...`);
            console.log("Raw initialSelectedItems:", initialSelectedItems, typeof initialSelectedItems);

            const validSelectedItems = Array.isArray(initialSelectedItems) ? initialSelectedItems : [];
            
            // Ensure only relevant selections are preserved
            if (currentField === 'competenceRequirements') {
                setSelectedItems(validSelectedItems.filter(item => 'description' in item)); 
            } else {
                setSelectedItems(validSelectedItems.filter(item => 'name' in item));
            }
            
            setCompetenceOptions([]);
        }
    }, [initialSelectedItems, currentField]);

    const fetchCompetenceData = async (teemaIds: string[]) => {
        try {
            const fetchedCompetences = await Promise.all(
                teemaIds.map(async (teemaId) => {
                    const { data } = await fetchCompetenceRequirements({
                        variables: { partId: teemaId },
                    });

                    if (data?.part?.parentQualificationUnit?.competenceRequirementGroups) {
                        return data.part.parentQualificationUnit.competenceRequirementGroups.flatMap(
                            (group: CompetenceRequirementGroup) =>
                                group.requirements.map((requirement: CompetenceRequirement) => ({
                                    id: requirement.id,
                                    description: requirement.description,
                                }))
                        );
                    }
                    return [];
                })
            );

            const combinedCompetences = fetchedCompetences.flat();
            setCompetenceOptions((prevCompetences) => {
                const updatedCompetences = [...prevCompetences, ...combinedCompetences];
                const uniqueCompetences = Array.from(new Set(updatedCompetences.map(item => item.id)))
                    .map(id => updatedCompetences.find(item => item.id === id));
                return uniqueCompetences;
            });

            setFetchedTeemaIds(prev => new Set([...prev, ...teemaIds]));

        } catch (error) {
            console.error('Error fetching competence requirements:', error);
        }
    };

    useEffect(() => {
        if (selectedItems.length > 0) {
            const selectedTeemaIds = selectedItems.map(item => item.id);
            fetchCompetenceData(selectedTeemaIds);
        }
    }, [selectedItems, open]);

    useEffect(() => {
        if (open && currentField === 'competenceRequirements') {
            const selectedTeemaIds = selectedItems.map(item => item.id);
            const newTeemaIds = selectedTeemaIds.filter(id => !fetchedTeemaIds.has(id));

            if (newTeemaIds.length > 0) {
                fetchCompetenceData(newTeemaIds);
            }
        }
    }, [selectedItems, currentField, fetchCompetenceRequirements, fetchedTeemaIds]); // ✅ Now fetchCompetenceData is available

    // Handle toggling the selection of an item
    const handleToggle = (value: Item) => async () => {
        // If the currentField is parentQualificationUnit, allow only one selection
        if (currentField === 'parentQualificationUnit') {
            setSelectedItems([value]);  // Replace with the only selected qualification unit
        } else {
            // For other fields (projects, parts), handle multiple selections
            const currentIndex = selectedItems.findIndex((item) => item.id === value.id);
            let newChecked = [...selectedItems];

            if (currentIndex === -1) {
                newChecked.push(value); // Add if it's not already selected
            } else {
                newChecked.splice(currentIndex, 1); // Remove if it's already selected
            }

            setSelectedItems(newChecked); // Update the selection state
        }
    };
    
    // Handle adding the selected items
    const handleAdd = () => {
        console.log("Added items:", selectedItems);
        onAdd([...selectedItems]);
        onClose();
    };

    // Handle search term change
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    // Handle adding a new item (tag)
    const handleAddNewItem = async () => {
        if (searchTerm && !items.some((item) => item.name === searchTerm)) {
            try {
                const { data } = await createProjectTag({
                    variables: { name: searchTerm },
                });
                const newTag = { id: data.createProjectTag.id, name: data.createProjectTag.name };
                setSearchTerm('');
                updateProjectTags(newTag);
            } catch (error) {
                console.error('Error creating new tag:', error);
            }
        }
    };

    const filteredItems = currentField === 'competenceRequirements'
    ? (competenceOptions.length > 0 ? competenceOptions : [])
    : items.filter((item) => item?.name?.toLowerCase().includes(searchTerm.toLowerCase()));

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
                                    {currentField === 'competenceRequirements' ? item.description : item.name}
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
                            <ListItemText                 
                                primary={currentField === 'competenceRequirements' ? item.description : item.name} 
                            />
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
